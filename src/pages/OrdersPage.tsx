import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  RotateCw, 
  Search, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Boxes, 
  Radio, 
  Barcode, 
  Calendar, 
  X,
  CreditCard,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Order, OrderStatus, ShippingCheckpoint } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';

interface OrdersPageProps {
  initialTrackingId?: string;
  navigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ initialTrackingId, navigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Dedicated Order Tracking Feature State (Input Tracking ID & Firestore Real-Time View)
  const [trackingInput, setTrackingInput] = useState<string>(initialTrackingId || '');
  const [isSearchingTracking, setIsSearchingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<Order | null>(null);
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  const [lastLivePing, setLastLivePing] = useState<Date | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [showAllCheckpoints, setShowAllCheckpoints] = useState(false);
  const [liveAlertMessage, setLiveAlertMessage] = useState<string | null>(null);

  const trackerUnsubRef = useRef<(() => void) | null>(null);
  const prevStatusRef = useRef<OrderStatus | null>(null);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  // Load customer's account orders
  const loadOrders = useCallback(async (quiet = false) => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }
    try {
      if (!quiet) setLoadingOrders(true);
      const res = await api.getOrders();
      const loadedOrders = res.orders || [];
      setOrders(loadedOrders);

      // If initialTrackingId was provided, prioritize tracking it;
      // otherwise, if no order is tracked yet, auto-select the first active order
      if (initialTrackingId) {
        handleTrackOrder(initialTrackingId);
      } else if (!activeTrackedOrder && loadedOrders.length > 0) {
        const firstActive = loadedOrders.find(o => o.status !== 'Delivered') || loadedOrders[0];
        setTrackingInput(firstActive.id);
        handleTrackOrder(firstActive.id);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      if (!quiet) setLoadingOrders(false);
    }
  }, [user, initialTrackingId]);

  useEffect(() => {
    loadOrders();
    return () => {
      if (trackerUnsubRef.current) {
        trackerUnsubRef.current();
      }
    };
  }, [loadOrders]);

  // Firestore Collection Real-time listener for current user's orders
  useEffect(() => {
    if (!user?.id) return;

    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.id)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveOrders: Order[] = [];
            snapshot.forEach(docSnap => {
              liveOrders.push(docSnap.data() as Order);
            });
            liveOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(liveOrders);
            setLoadingOrders(false);
          }
        },
        (error) => {
          console.warn('Firestore orders collection listener:', error.message);
          try {
            handleFirestoreError(error, OperationType.GET, 'orders');
          } catch {
            // graceful fallback
          }
        }
      );

      return () => unsubscribe();
    } catch {
      // Handled
    }
  }, [user?.id]);

  // CORE FEATURE: Track Order by Input Tracking ID / Order ID / AWB using Firestore
  const handleTrackOrder = async (idToSearch?: string) => {
    const rawId = (idToSearch !== undefined ? idToSearch : trackingInput).trim();
    if (!rawId) {
      setTrackingError('Please enter a valid Tracking ID, AWB, or Order ID.');
      return;
    }

    // Clean previous listener
    if (trackerUnsubRef.current) {
      trackerUnsubRef.current();
      trackerUnsubRef.current = null;
    }

    try {
      setIsSearchingTracking(true);
      setTrackingError(null);
      let foundOrder: Order | null = null;

      // 1. Check directly in Firestore by Document ID
      try {
        const orderDocRef = doc(db, 'orders', rawId);
        const docSnap = await getDoc(orderDocRef);
        if (docSnap.exists()) {
          foundOrder = docSnap.data() as Order;
        }
      } catch (err: any) {
        console.warn('Firestore doc lookup note:', err?.message);
      }

      // 2. If not found by Doc ID, query Firestore collection by id or trackingNumber
      if (!foundOrder) {
        try {
          // Query by `id` field
          const qById = query(collection(db, 'orders'), where('id', '==', rawId));
          const snapById = await getDocs(qById);
          if (!snapById.empty) {
            foundOrder = snapById.docs[0].data() as Order;
          } else {
            // Query by `shippingInfo.trackingNumber` (AWB)
            const qByAwb = query(collection(db, 'orders'), where('shippingInfo.trackingNumber', '==', rawId));
            const snapByAwb = await getDocs(qByAwb);
            if (!snapByAwb.empty) {
              foundOrder = snapByAwb.docs[0].data() as Order;
            }
          }
        } catch (err: any) {
          console.warn('Firestore collection query note:', err?.message);
        }
      }

      // 3. Fallback: Query REST API if Firestore query was unable to locate
      if (!foundOrder) {
        try {
          const res = await api.getOrderById(rawId);
          if (res?.order) {
            foundOrder = res.order;
          }
        } catch {
          // Fallback to searching in local orders
          const foundInLocal = orders.find(
            o => o.id.toLowerCase() === rawId.toLowerCase() || 
                 (o.shippingInfo?.trackingNumber && o.shippingInfo.trackingNumber.toLowerCase() === rawId.toLowerCase())
          );
          if (foundInLocal) {
            foundOrder = foundInLocal;
          }
        }
      }

      if (!foundOrder) {
        setTrackingError(`No active shipment found for "${rawId}". Please verify your Tracking ID or Order ID.`);
        setActiveTrackedOrder(null);
        setIsFirestoreLive(false);
        return;
      }

      // Found order! Set state
      setActiveTrackedOrder(foundOrder);
      setTrackingInput(foundOrder.id);
      prevStatusRef.current = foundOrder.status;
      setIsFirestoreLive(true);
      setLastLivePing(new Date());

      // 4. Attach real-time Firestore listener to this order document
      try {
        const orderDocRef = doc(db, 'orders', foundOrder.id);
        const unsubscribe = onSnapshot(
          orderDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const liveData = snapshot.data() as Order;
              setIsFirestoreLive(true);
              setLastLivePing(new Date());

              // Detect status update made in admin
              if (liveData.status && liveData.status !== prevStatusRef.current) {
                setLiveAlertMessage(`Shipment status updated to "${liveData.status}" in real-time!`);
                prevStatusRef.current = liveData.status;
                setTimeout(() => setLiveAlertMessage(null), 7000);
              }

              setActiveTrackedOrder(prev => ({
                ...prev,
                ...liveData,
                id: prev?.id || liveData.id,
                shippingInfo: liveData.shippingInfo || prev?.shippingInfo
              }));
            }
          },
          (err) => {
            console.warn('Real-time order listener fallback:', err?.message);
            setIsFirestoreLive(false);
          }
        );
        trackerUnsubRef.current = unsubscribe;
      } catch (err: any) {
        console.warn('Could not attach Firestore onSnapshot:', err?.message);
      }

      // Smooth scroll to tracking telemetry view
      setTimeout(() => {
        const el = document.getElementById('shipment-tracking-view');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);

    } catch (err: any) {
      setTrackingError(err?.message || 'Failed to locate shipment tracking details.');
      setActiveTrackedOrder(null);
    } finally {
      setIsSearchingTracking(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      if (activeTrackedOrder) {
        await handleTrackOrder(activeTrackedOrder.id);
      }
      await loadOrders(true);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleCopyTrackingNumber = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTrackingId(id);
    setTimeout(() => setCopiedTrackingId(null), 2500);
  };

  const handlePasteTrackingInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTrackingInput(text.trim());
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Order Confirmed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            Packaging & QC
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            In Transit (Shipped)
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Delivered
          </span>
        );
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    return statuses.indexOf(status);
  };

  // Filter orders for history list
  const filteredOrders = orders.filter(order => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? order.status !== 'Delivered' :
      order.status === 'Delivered';

    const matchesSearch = !searchQuery.trim() || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (order.shippingInfo?.trackingNumber && order.shippingInfo.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      order.shippingAddress.city.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesFilter && matchesSearch;
  });

  const activeCount = orders.filter(o => o.status !== 'Delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Order Tracking & Shipment Status
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Input your Tracking ID or Order ID to inspect live courier telemetry, real-time shipment milestones, and express delivery updates powered by Firestore.
          </p>
        </div>

        {/* Live Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto active:scale-95"
          title="Refresh live status from server and Firestore"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Live Status'}</span>
        </button>
      </div>

      {/* 2. CORE FEATURE: INPUT TRACKING ID SEARCH CARD */}
      <section className="bg-gradient-to-br from-[#0c0f2b] to-[#070919] p-5 sm:p-7 rounded-3xl border-2 border-cyan-500/30 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Ambient Backlight Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-md">
              <Truck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-white">
                  Input Tracking ID or Order ID
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Firestore Live
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Track any package using its Order ID (ord-...) or BlueDart Express AWB number.
              </p>
            </div>
          </div>

          {activeTrackedOrder && (
            <button
              onClick={() => {
                setActiveTrackedOrder(null);
                setTrackingInput('');
              }}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Tracker</span>
            </button>
          )}
        </div>

        {/* Input & Track Button Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleTrackOrder();
          }}
          className="relative z-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              required
              placeholder="e.g. ord-17482... or BG-BLUEDART-98124"
              value={trackingInput}
              onChange={(e) => {
                setTrackingInput(e.target.value);
                if (trackingError) setTrackingError(null);
              }}
              className="w-full bg-slate-950/90 border border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white pl-10 pr-24 py-3 rounded-2xl text-xs sm:text-sm font-mono placeholder:text-slate-500 transition outline-hidden shadow-inner"
            />
            <Barcode className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
            
            <button
              type="button"
              onClick={handlePasteTrackingInput}
              className="absolute right-3 top-2.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
              title="Paste from clipboard"
            >
              Paste
            </button>
          </div>

          <button
            type="submit"
            disabled={isSearchingTracking || !trackingInput.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSearchingTracking ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Querying Firestore...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950" />
                <span>Track Shipment</span>
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {trackingError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{trackingError}</span>
          </div>
        )}

        {/* Quick Recent Order Chips */}
        {orders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Quick Track Orders:
            </span>
            {orders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setTrackingInput(o.id);
                  handleTrackOrder(o.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTrackedOrder?.id === o.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-slate-700/80'
                }`}
              >
                <span>{o.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="text-[10px] opacity-80">{o.status}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 3. REAL-TIME SHIPMENT STATUS DISPLAY (POWERED BY FIRESTORE) */}
      {activeTrackedOrder && (
        <section id="shipment-tracking-view" className="scroll-mt-24 space-y-6">
          
          {/* Live Alert Toast if admin updated status in background */}
          {liveAlertMessage && (
            <div className="p-4 bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-3 animate-bounce shadow-xl">
              <Sparkles className="w-5 h-5 text-cyan-300 shrink-0" />
              <span>{liveAlertMessage}</span>
            </div>
          )}

          <div className="bg-[#0b0e26] rounded-3xl border border-cyan-500/40 p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Real-time Status Card Top Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono font-black text-lg sm:text-xl text-white">
                    {activeTrackedOrder.id}
                  </span>
                  {getStatusBadge(activeTrackedOrder.status)}
                  
                  {isFirestoreLive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>Live Telemetry Active</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Placed on {new Date(activeTrackedOrder.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Carrier: <strong className="text-white">{activeTrackedOrder.shippingInfo?.carrier || 'BlueDart Express'}</strong></span>
                  {activeTrackedOrder.shippingInfo?.trackingNumber && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        AWB: <strong className="text-cyan-300">{activeTrackedOrder.shippingInfo.trackingNumber}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopyTrackingNumber(activeTrackedOrder.shippingInfo!.trackingNumber)}
                          className="p-1 hover:text-white transition cursor-pointer"
                          title="Copy AWB Number"
                        >
                          {copiedTrackingId === activeTrackedOrder.shippingInfo.trackingNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Estimated Handover */}
              <div className="p-3 sm:p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3 shrink-0">
                <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Estimated Delivery
                  </span>
                  <p className="font-heading font-black text-xs sm:text-sm text-cyan-300">
                    {activeTrackedOrder.shippingInfo?.estimatedDelivery || 'Within 2-3 Business Days'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar (Milestones from Placed to Delivered) */}
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>Shipment Fulfillment Progress</span>
                <span className="text-cyan-400 font-mono">
                  Stage {getStatusStepIndex(activeTrackedOrder.status) + 1} of 5
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 relative">
                {statuses.map((step, idx) => {
                  const currentIdx = getStatusStepIndex(activeTrackedOrder.status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center text-center space-y-2">
                      <div 
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition shadow-md ${
                          isCompleted
                            ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950'
                            : 'bg-slate-900 border border-slate-800 text-slate-500'
                        } ${isCurrent ? 'ring-4 ring-cyan-500/30 animate-pulse' : ''}`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-slate-950" /> : idx + 1}
                      </div>

                      <span className={`text-[10px] sm:text-xs font-bold leading-tight ${
                        isCompleted ? 'text-white' : 'text-slate-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Courier Telemetry Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* Current Location */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>Current Live Location</span>
                </div>
                <p className="font-bold text-white text-sm">
                  {activeTrackedOrder.shippingInfo?.currentLocation || `${activeTrackedOrder.shippingAddress.city} Central Hub`}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Last verified ping: {lastLivePing ? lastLivePing.toLocaleTimeString() : 'Real-time via Firestore'}
                </span>
              </div>

              {/* Recipient Destination */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Package className="w-4 h-4" />
                  <span>Destination Address</span>
                </div>
                <p className="font-bold text-white truncate">
                  {activeTrackedOrder.shippingAddress.fullName}
                </p>
                <span className="text-[10px] text-slate-400 block truncate">
                  {activeTrackedOrder.shippingAddress.city}, {activeTrackedOrder.shippingAddress.state} - {activeTrackedOrder.shippingAddress.pincode}
                </span>
              </div>

              {/* Payment & Security */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 space-y-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment & Invoice Total</span>
                </div>
                <p className="font-bold text-white text-sm">
                  ₹{activeTrackedOrder.total.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Method: {activeTrackedOrder.paymentMethod} • Verified Order
                </span>
              </div>

            </div>

            {/* Checkpoints Timeline (Live Dispatch Updates) */}
            {activeTrackedOrder.shippingInfo?.checkpoints && activeTrackedOrder.shippingInfo.checkpoints.length > 0 && (
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                    <Clock className="w-4 h-4" />
                    <span>Real-Time Shipment Checkpoints</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllCheckpoints(!showAllCheckpoints)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <span>{showAllCheckpoints ? 'Show Less' : `View All (${activeTrackedOrder.shippingInfo.checkpoints.length})`}</span>
                    {showAllCheckpoints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-3">
                  {(showAllCheckpoints 
                    ? activeTrackedOrder.shippingInfo.checkpoints 
                    : activeTrackedOrder.shippingInfo.checkpoints.slice(-3)
                  ).map((cp, idx) => (
                    <div key={cp.id || idx} className="flex items-start gap-3 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        cp.completed 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}>
                        {cp.completed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <p className={`font-bold ${cp.completed ? 'text-white' : 'text-slate-400'}`}>
                            {cp.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(cp.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {cp.description} — <strong className="text-slate-300">{cp.location}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipment Items & Invoice Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {activeTrackedOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0">
                    <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    <div>
                      <p className="text-[11px] font-bold text-white max-w-[130px] truncate">{item.name}</p>
                      <span className="text-[10px] text-cyan-400/90 font-mono">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/orders/${activeTrackedOrder.id}`)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>View Official Invoice</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 4. CUSTOMER ORDERS HISTORY LIST */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-black text-xl text-white">
              My Orders & Purchase Receipts
            </h2>
            <p className="text-xs text-slate-400">
              Select any order to launch real-time shipment telemetry or view purchase invoices.
            </p>
          </div>

          {/* Filter Pills */}
          {user && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filter === 'active'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>In-Transit ({activeCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter('delivered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filter === 'delivered'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Delivered ({deliveredCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Not Logged In Prompt */}
        {!user && (
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-3">
            <Package className="w-8 h-8 text-cyan-400 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Sign in with your account to view your saved order history and receipts, or use the <strong>Input Tracking ID</strong> search box above to track any live order.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              Sign In to BUYGEN
            </button>
          </div>
        )}

        {/* Loading State */}
        {user && loadingOrders && (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RotateCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
            <p className="text-xs">Fetching customer order history...</p>
          </div>
        )}

        {/* Empty State */}
        {user && !loadingOrders && orders.length === 0 && (
          <div className="p-10 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-heading font-black text-base text-white">No Orders on this Account</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't placed an order yet. Use the tracking search bar above if you have a Tracking ID from another purchase, or explore the catalog!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        )}

        {/* Orders List Cards */}
        {user && !loadingOrders && orders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No orders match your filter criteria.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isCurrentlyTracked = activeTrackedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    className={`p-5 sm:p-6 bg-[#0c0f26] rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                      isCurrentlyTracked
                        ? 'border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-sm text-white">{order.id}</span>
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {order.paymentMethod}
                        </span>
                      </div>

                      {/* Items preview */}
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {order.items.map((item) => (
                          <div 
                            key={item.productId} 
                            className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800/90 shrink-0"
                          >
                            <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="text-xs font-bold text-white max-w-[140px] truncate">{item.name}</p>
                              <span className="text-[10px] text-cyan-400/80 font-mono">
                                ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping address preview */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          Deliver to: <strong className="text-slate-200">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode})
                        </span>
                      </div>
                    </div>

                    {/* Right Actions & Total */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-slate-400 block">Total Amount</span>
                        <span className="font-heading font-black text-xl text-white">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Live Track Shipment Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTrackingInput(order.id);
                            handleTrackOrder(order.id);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isCurrentlyTracked
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{isCurrentlyTracked ? 'Tracking Now' : 'Track Shipment'}</span>
                        </button>

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>Invoice</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

    </div>
  );
};
