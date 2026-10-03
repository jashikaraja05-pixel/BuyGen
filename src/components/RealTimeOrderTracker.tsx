import React, { useEffect, useState, useRef } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  AlertCircle,
  RotateCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import type { Order, OrderStatus, ShippingInfo, ShippingCheckpoint } from '../types/index.ts';

interface RealTimeOrderTrackerProps {
  order: Order;
  onOrderUpdated?: (updatedOrder: Order) => void;
  compact?: boolean;
}

export const RealTimeOrderTracker: React.FC<RealTimeOrderTrackerProps> = ({ 
  order: initialOrder, 
  onOrderUpdated,
  compact = false 
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [lastLivePing, setLastLivePing] = useState<Date>(new Date());
  const [statusChangeAlert, setStatusChangeAlert] = useState<string | null>(null);
  const [showAllCheckpoints, setShowAllCheckpoints] = useState(false);
  const prevStatusRef = useRef<OrderStatus>(initialOrder.status);

  // Sync internal state if parent passed updated initialOrder
  useEffect(() => {
    setOrder(prev => {
      if (prev.id === initialOrder.id && prev.updatedAt === initialOrder.updatedAt) {
        return prev;
      }
      return initialOrder;
    });
  }, [initialOrder]);

  // Firestore Real-Time Listener on `orders/{orderId}`
  useEffect(() => {
    if (!order.id) return;

    const docPath = `orders/${order.id}`;
    const orderDocRef = doc(db, 'orders', order.id);

    const unsubscribe = onSnapshot(
      orderDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const liveData = snapshot.data() as Order;
          setIsLiveConnected(true);
          setLastLivePing(new Date());

          // Detect live status change set by admin
          if (liveData.status && liveData.status !== prevStatusRef.current) {
            setStatusChangeAlert(`Order #${liveData.id} status updated to "${liveData.status}" in real-time by admin!`);
            prevStatusRef.current = liveData.status;

            // Auto-hide alert after 7 seconds
            setTimeout(() => {
              setStatusChangeAlert(null);
            }, 7000);
          }

          setOrder(prev => {
            const merged: Order = {
              ...prev,
              ...liveData,
              id: prev.id,
              shippingInfo: liveData.shippingInfo || prev.shippingInfo
            };
            if (onOrderUpdated) {
              onOrderUpdated(merged);
            }
            return merged;
          });
        }
      },
      (error) => {
        console.warn('Real-time Firestore listener fallback:', error.message);
        setIsLiveConnected(false);
        try {
          handleFirestoreError(error, OperationType.GET, docPath);
        } catch {
          // Graceful fallback to client state
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [order.id, onOrderUpdated]);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = statuses.indexOf(order.status);

  // Compute AWB number
  const awbNumber = order.shippingInfo?.trackingNumber || `BG-BLUEDART-${order.id.replace(/[^0-9]/g, '') || '84920'}`;
  const carrierName = order.shippingInfo?.carrier || 'BlueDart Air Priority';
  const currentLocation = order.shippingInfo?.currentLocation || 
    (order.status === 'Delivered' 
      ? `Delivered at ${order.shippingAddress?.city || 'Destination'}` 
      : order.status === 'Shipped'
      ? `In Transit to ${order.shippingAddress?.city || 'Destination'}`
      : 'Central Fulfillment Hub, Bengaluru');

  const handleCopyAWB = () => {
    navigator.clipboard.writeText(awbNumber);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Order Confirmed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            Packaging & QC
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-black">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            In Transit (Shipped)
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-black">
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            Delivered
          </span>
        );
    }
  };

  // Checkpoints list (either from order.shippingInfo or generated default)
  const checkpoints: ShippingCheckpoint[] = order.shippingInfo?.checkpoints || [
    {
      id: '1',
      status: 'Pending',
      title: 'Order Placed',
      description: 'Order received and logged in BUYGEN central processing system.',
      location: 'Customer Portal',
      timestamp: order.createdAt,
      completed: currentStepIndex >= 0,
      current: currentStepIndex === 0
    },
    {
      id: '2',
      status: 'Confirmed',
      title: 'Payment & Order Verified',
      description: `Payment verified via ${order.paymentMethod}. Inventory allocated at Central Warehouse.`,
      location: 'Bengaluru Central Warehouse',
      timestamp: order.createdAt,
      completed: currentStepIndex >= 1,
      current: currentStepIndex === 1
    },
    {
      id: '3',
      status: 'Processing',
      title: 'Quality Check & Anti-Static Sealing',
      description: 'Item serial number registered for warranty and safely boxed with bubble wrap.',
      location: 'Bengaluru Fulfillment Station',
      timestamp: order.updatedAt,
      completed: currentStepIndex >= 2,
      current: currentStepIndex === 2
    },
    {
      id: '4',
      status: 'Shipped',
      title: `Dispatched via ${carrierName}`,
      description: `Package picked up by courier. Tracking code generated for express transit.`,
      location: 'Air Cargo Terminal, Bengaluru',
      timestamp: order.updatedAt,
      completed: currentStepIndex >= 3,
      current: currentStepIndex === 3
    },
    {
      id: '5',
      status: 'Delivered',
      title: 'Delivered to Customer',
      description: `Shipment handed over to customer at ${order.shippingAddress?.address || 'destination'}.`,
      location: `${order.shippingAddress?.city || 'Local Delivery'} Hub`,
      timestamp: order.updatedAt,
      completed: currentStepIndex >= 4,
      current: currentStepIndex === 4
    }
  ];

  const displayedCheckpoints = showAllCheckpoints 
    ? checkpoints 
    : checkpoints.filter(c => c.completed || c.current);

  return (
    <div className="bg-[#0c102a] rounded-3xl border border-cyan-500/30 p-5 sm:p-7 shadow-[0_0_35px_rgba(6,182,212,0.12)] relative overflow-hidden space-y-6 text-white">
      
      {/* Background Decorative Radial */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Real-time Status Alert Banner (Triggers upon live status update by Admin) */}
      {statusChangeAlert && (
        <div className="relative z-20 p-3.5 bg-gradient-to-r from-cyan-950 via-indigo-950 to-slate-950 border border-cyan-400 rounded-2xl flex items-center justify-between gap-3 shadow-lg shadow-cyan-500/20 animate-bounce">
          <div className="flex items-center gap-2.5 text-xs text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold">{statusChangeAlert}</span>
          </div>
          <button 
            onClick={() => setStatusChangeAlert(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-900 border border-slate-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header: Tracking Indicator + Live Connection Status */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Real-Time Shipment Tracking</span>
            </span>

            {/* Live Firestore Connection Status */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Firestore Live</span>
            </span>
          </div>

          <h3 className="font-heading font-black text-xl sm:text-2xl text-white flex flex-wrap items-center gap-2.5">
            <span>Order #{order.id}</span>
            {getStatusBadge(order.status)}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Tracking updates fetch in real-time directly from Firestore as the store administrator updates fulfillment status.
          </p>
        </div>

        {/* Carrier & AWB Badge with Copy Feature */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Carrier:</span>
            <strong className="text-white font-bold">{carrierName}</strong>
          </div>

          <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">AWB:</span>
            <span className="font-mono font-bold text-cyan-300">{awbNumber}</span>
            <button
              type="button"
              onClick={handleCopyAWB}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              title="Copy AWB Tracking Number"
            >
              {copiedAWB ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="relative z-10 pt-3 pb-3">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute top-5 left-5 right-5 h-1.5 bg-slate-900 rounded-full -translate-y-1/2 z-0 border border-slate-800"></div>

          {/* Active Gradient Fill Line */}
          <div 
            className="absolute top-5 left-5 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 rounded-full -translate-y-1/2 z-0 transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.7)]"
            style={{ 
              width: `${(Math.max(0, currentStepIndex) / (statuses.length - 1)) * 90}%` 
            }}
          ></div>

          {statuses.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center group">
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-lg ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 ring-4 ring-cyan-500/30 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.6)] font-black'
                      : isCompleted
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <Radio className="w-4 h-4 stroke-[3] animate-pulse" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span className={`text-[11px] mt-2 font-bold text-center whitespace-nowrap transition ${
                  isCurrent 
                    ? 'text-cyan-300 font-black' 
                    : isCompleted 
                    ? 'text-slate-200' 
                    : 'text-slate-500'
                }`}>
                  {step}
                </span>

                {isCurrent && (
                  <span className="hidden sm:inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mt-0.5 animate-pulse">
                    Active Step
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment Details Highlights Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        
        {/* Estimated Delivery */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Estimated Delivery Date
          </span>
          <p className="font-heading font-black text-sm text-cyan-300">
            {order.status === 'Delivered' 
              ? 'Delivered Successfully' 
              : (order.shippingInfo?.estimatedDelivery || 'Within 3 Business Days')}
          </p>
          <span className="text-[11px] text-slate-400 block">
            {order.status === 'Delivered' 
              ? 'Package received by customer' 
              : 'Direct Warehouse Express Air Route'}
          </span>
        </div>

        {/* Current Location Hub */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Location / Hub
          </span>
          <p className="font-heading font-bold text-sm text-indigo-300 truncate">
            {currentLocation}
          </p>
          <span className="text-[11px] text-slate-400 block">
            Updated: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Destination Address */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Shipping Destination
          </span>
          <p className="font-heading font-bold text-sm text-white truncate">
            {order.shippingAddress?.city}, {order.shippingAddress?.state}
          </p>
          <span className="text-[11px] text-slate-400 block">
            PIN: {order.shippingAddress?.pincode} • Phone: {order.customerPhone}
          </span>
        </div>

      </div>

      {/* Checkpoints Timeline */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shipping Milestones & Checkpoint Log</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllCheckpoints(!showAllCheckpoints)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 transition"
          >
            <span>{showAllCheckpoints ? 'Show Active Only' : 'View All Milestones'}</span>
            {showAllCheckpoints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {displayedCheckpoints.map((cp) => (
            <div 
              key={cp.id}
              className={`p-3.5 rounded-2xl border transition flex items-start gap-3.5 ${
                cp.current
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-100 shadow-sm'
                  : cp.completed
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  : 'bg-slate-950/30 border-slate-900 text-slate-500'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                cp.current
                  ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 font-bold'
                  : cp.completed
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-600'
              }`}>
                {cp.completed ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : cp.current ? (
                  <Radio className="w-4 h-4 stroke-[3] animate-pulse" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                    <span>{cp.title}</span>
                    {cp.current && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-black uppercase">
                        Current
                      </span>
                    )}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(cp.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {cp.description}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{cp.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Pill */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time updates synchronize automatically from Firestore without page refresh.</span>
        </div>
        <span className="text-slate-500 font-mono">
          Last Signal: {lastLivePing.toLocaleTimeString()}
        </span>
      </div>

    </div>
  );
};
