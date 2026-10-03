import React, { useEffect, useState, useCallback } from 'react';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  RotateCw, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Boxes
} from 'lucide-react';
import type { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { RealTimeOrderTracker } from '../components/RealTimeOrderTracker.tsx';

interface OrdersPageProps {
  navigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  // Auto-fetch orders via REST initially, and subscribe to real-time Firestore collection updates
  const loadOrders = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await api.getOrders();
      const loadedOrders = res.orders || [];
      setOrders(loadedOrders);

      // Auto-select first active order for live tracking if none selected yet
      if (!trackedOrderId && loadedOrders.length > 0) {
        const firstActive = loadedOrders.find(o => o.status !== 'Delivered') || loadedOrders[0];
        setTrackedOrderId(firstActive.id);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [trackedOrderId]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate, loadOrders]);

  // Firestore Real-Time Listener across customer orders
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
            setLoading(false);

            if (!trackedOrderId && liveOrders.length > 0) {
              const active = liveOrders.find(o => o.status !== 'Delivered') || liveOrders[0];
              setTrackedOrderId(active.id);
            }
          }
        },
        (error) => {
          console.warn('Firestore orders collection subscription:', error.message);
          try {
            handleFirestoreError(error, OperationType.GET, 'orders');
          } catch {
            // fallback gracefully
          }
        }
      );

      return () => unsubscribe();
    } catch {
      // Handled
    }
  }, [user?.id, trackedOrderId]);

  // Handle single order real-time snapshot update
  const handleOrderUpdatedFromRealTime = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrders(true);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedId(awb);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Order Confirmed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
            Packaging & QC
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            In Transit (Shipped)
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Delivered
          </span>
        );
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    return statuses.indexOf(status);
  };

  const getEstimatedDeliveryDate = (order: Order) => {
    const created = new Date(order.createdAt);
    const est = new Date(created);
    est.setDate(est.getDate() + 3);
    return est.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generateAWB = (orderId: string) => {
    const cleanNum = orderId.replace(/[^0-9]/g, '') || '98124';
    return `BG-BLUEDART-${cleanNum}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? order.status !== 'Delivered' :
      order.status === 'Delivered';

    const matchesSearch = !searchQuery.trim() || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      order.shippingAddress.city.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesFilter && matchesSearch;
  });

  const trackedOrder = orders.find(o => o.id === trackedOrderId) || orders[0];
  const activeCount = orders.filter(o => o.status !== 'Delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto animate-spin">
          <RotateCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-cyan-300">Fetching Real-Time Order & Tracking Data...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto shadow-xl">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="font-heading font-black text-2xl text-white">No Orders Yet</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          You haven't placed any consumer electronics orders yet. Explore our flagships and accessories with instant UPI QR and COD checkout!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition cursor-pointer"
        >
          Explore Electronics Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* 1. Header & Live Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Order History & Live Tracking
            </h1>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time fulfillment tracking, BlueDart dispatch milestones, and complete purchase receipts.
          </p>
        </div>

        {/* Live Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
          title="Refresh live status from server"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* 2. REAL-TIME SHIPPING TRACKER FEATURE (Fetches Live Shipping Updates from Firestore) */}
      {trackedOrder && (
        <div id="realtime-tracker" className="scroll-mt-24">
          <RealTimeOrderTracker 
            order={trackedOrder} 
            onOrderUpdated={handleOrderUpdatedFromRealTime} 
          />
        </div>
      )}

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
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
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'active'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Active & In-Transit ({activeCount})</span>
          </button>
          <button
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

        {/* Search by Order ID */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by Order ID or gadget name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

      </div>

      {/* 4. Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No orders found matching your search and filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCurrentlyTracked = trackedOrderId === order.id;

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
                          <span className="text-[10px] text-cyan-400/80 font-mono">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address preview */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deliver to: <strong className="text-slate-200">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode})</span>
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
                      onClick={() => {
                        setTrackedOrderId(order.id);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
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

    </div>
  );
};
