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

  // Periodic real-time auto-refresh for active orders
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadOrders(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [user, loadOrders]);

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

      {/* 2. REAL-TIME SHIPPING TRACKER FEATURE (Dedicated Active Order Tracking) */}
      {trackedOrder && (
        <div className="bg-[#0c0f26] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden space-y-6">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Tracking Header Bar */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Real-Time Shipment Tracking</span>
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white flex items-center gap-3">
                <span>Order #{trackedOrder.id}</span>
                {getStatusBadge(trackedOrder.status)}
              </h2>
            </div>

            {/* AWB & Dispatch Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <span className="text-slate-400">AWB Tracking:</span>
                <span className="font-mono font-bold text-cyan-300">{generateAWB(trackedOrder.id)}</span>
                <button
                  onClick={() => handleCopyAWB(generateAWB(trackedOrder.id))}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copy AWB Tracking Number"
                >
                  {copiedId === generateAWB(trackedOrder.id) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                <span className="text-slate-400">Carrier: </span>
                <strong className="text-white">BlueDart Air Priority</strong>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative z-10 pt-2 pb-4">
            {/* Connecting Bar */}
            <div className="relative flex items-center justify-between">
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
              <div 
                className="absolute top-5 left-6 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{ 
                  width: `${(Math.max(0, getStatusStepIndex(trackedOrder.status)) / (statuses.length - 1)) * 92}%` 
                }}
              ></div>

              {statuses.map((step, idx) => {
                const currentIdx = getStatusStepIndex(trackedOrder.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center group">
                    <div 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 ring-4 ring-cyan-500/20 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                          : isPassed
                          ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-500/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                    </div>

                    <span className={`text-[11px] font-bold mt-2.5 text-center whitespace-nowrap transition ${
                      isCurrent 
                        ? 'text-cyan-300 font-black' 
                        : isPassed 
                        ? 'text-slate-200' 
                        : 'text-slate-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Tracking Highlights Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estimated Delivery
              </span>
              <p className="font-heading font-black text-sm text-cyan-300">
                {trackedOrder.status === 'Delivered' 
                  ? 'Delivered Successfully' 
                  : getEstimatedDeliveryDate(trackedOrder)}
              </p>
              <span className="text-[11px] text-slate-500">
                {trackedOrder.status === 'Delivered' ? 'Package received by customer' : 'Guaranteed Express Delivery'}
              </span>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Destination Address
              </span>
              <p className="font-heading font-bold text-sm text-white truncate">
                {trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state}
              </p>
              <span className="text-[11px] text-slate-500">
                PIN: {trackedOrder.shippingAddress.pincode} • Phone: {trackedOrder.customerPhone}
              </span>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Location Hub
              </span>
              <p className="font-heading font-bold text-sm text-indigo-300">
                {trackedOrder.status === 'Pending' && 'Fulfillment Queue (Bengaluru Hub)'}
                {trackedOrder.status === 'Confirmed' && 'Central Warehouse (Bengaluru 560100)'}
                {trackedOrder.status === 'Processing' && 'Packing & Tamper-Sealing Station'}
                {trackedOrder.status === 'Shipped' && `In Transit -> ${trackedOrder.shippingAddress.city} Delivery Hub`}
                {trackedOrder.status === 'Delivered' && `Delivered at ${trackedOrder.shippingAddress.city}`}
              </p>
              <span className="text-[11px] text-slate-500">
                Updated: {new Date(trackedOrder.updatedAt || trackedOrder.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Live Checkpoint Log */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Dispatch Checkpoints Log</span>
            </h4>

            <div className="space-y-3">
              {/* Checkpoint 4: Delivered */}
              {getStatusStepIndex(trackedOrder.status) >= 4 && (
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 ring-4 ring-emerald-500/20 shrink-0"></div>
                  <div>
                    <p className="font-bold text-emerald-300">Delivered — Package Handed Over with OTP</p>
                    <p className="text-[11px] text-slate-400">Delivered directly to {trackedOrder.shippingAddress.fullName} at {trackedOrder.shippingAddress.address}</p>
                  </div>
                </div>
              )}

              {/* Checkpoint 3: Shipped */}
              {getStatusStepIndex(trackedOrder.status) >= 3 && (
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1 ring-4 ring-cyan-500/20 shrink-0"></div>
                  <div>
                    <p className="font-bold text-cyan-300">In Transit — BlueDart Express Cargo Flight 824</p>
                    <p className="text-[11px] text-slate-400">Dispatched from Bengaluru Sorting Hub. Arrived at {trackedOrder.shippingAddress.city} Regional Delivery Facility.</p>
                  </div>
                </div>
              )}

              {/* Checkpoint 2: Processing */}
              {getStatusStepIndex(trackedOrder.status) >= 2 && (
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400 mt-1 ring-4 ring-purple-500/20 shrink-0"></div>
                  <div>
                    <p className="font-bold text-purple-300">Quality Verified & Packaging Complete</p>
                    <p className="text-[11px] text-slate-400">Serial numbers registered, anti-static sealed, and boxed for air express transit.</p>
                  </div>
                </div>
              )}

              {/* Checkpoint 1: Confirmed */}
              {getStatusStepIndex(trackedOrder.status) >= 1 && (
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 ring-4 ring-blue-500/20 shrink-0"></div>
                  <div>
                    <p className="font-bold text-blue-300">Order Confirmed by BUYGEN Store Admin</p>
                    <p className="text-[11px] text-slate-400">Stock allocated atomically from central inventory database.</p>
                  </div>
                </div>
              )}

              {/* Checkpoint 0: Placed */}
              <div className="flex items-start gap-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0"></div>
                <div>
                  <p className="font-bold text-slate-300">Order Placed Successfully ({trackedOrder.paymentMethod})</p>
                  <p className="text-[11px] text-slate-500">{new Date(trackedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Link to Full Receipt */}
          <div className="relative z-10 flex justify-end pt-2">
            <button
              onClick={() => navigate(`/orders/${trackedOrder.id}`)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>View Full Order Invoice & Receipt</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

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
