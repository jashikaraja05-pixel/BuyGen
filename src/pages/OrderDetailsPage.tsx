import React, { useEffect, useState, useCallback } from 'react';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Check, 
  Clock, 
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCw,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { RealTimeOrderTracker } from '../components/RealTimeOrderTracker.tsx';

interface OrderDetailsPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, navigate }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const loadOrder = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await api.getOrderById(orderId);
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Could not load order');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrder();
  }, [user, navigate, loadOrder]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrder(true);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const getAWB = (id: string) => {
    const cleanNum = id.replace(/[^0-9]/g, '') || '98124';
    return `BG-BLUEDART-${cleanNum}`;
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto animate-spin">
          <RotateCw className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-cyan-300">Loading order & shipping details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading font-black text-2xl text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This order does not exist or you do not have permission to view it.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          Back to Order History
        </button>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(order.status);
  const awb = getAWB(order.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition cursor-pointer"
            title="Back to Orders"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
              <span>Order #{order.id}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Status'}</span>
          </button>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {order.status}
          </span>
        </div>
      </div>

      {/* Real-time Order Tracking Component (Live Firestore Sync) */}
      <RealTimeOrderTracker 
        order={order} 
        onOrderUpdated={(updated) => setOrder(updated)} 
      />

      {/* Ordered Products Table */}
      <div className="bg-[#0c0f26] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-heading font-black text-base text-white">
          Items in this Shipment ({order.items.reduce((s, i) => s + i.quantity, 0)})
        </h2>

        <div className="divide-y divide-slate-800/80">
          {order.items.map((item) => (
            <div key={item.productId} className="py-4 flex items-center justify-between gap-4">
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/products/${item.productId}`)}
              >
                <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-cyan-400/80 uppercase">{item.brand}</span>
                  <h4 className="font-heading font-bold text-sm text-white hover:text-cyan-400 transition">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <span className="font-heading font-black text-base text-white whitespace-nowrap">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-white">₹{(order.subtotal + order.discount).toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Discounts Applied</span>
              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-400">
            <span>Express Dispatch</span>
            <span className="text-emerald-400 font-bold uppercase text-xs">FREE</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between font-heading font-bold text-base text-white">
            <span>Total Paid</span>
            <span className="text-cyan-400 font-black text-2xl">₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Address & Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#0c0f26] rounded-3xl border border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-heading font-black text-sm text-cyan-400">
            <MapPin className="w-4 h-4" />
            <span>Delivery Destination</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 space-y-1">
            <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>

        <div className="bg-[#0c0f26] rounded-3xl border border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-heading font-black text-sm text-cyan-400">
            <CreditCard className="w-4 h-4" />
            <span>Payment Method</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 space-y-1">
            <p className="font-bold text-white">{order.paymentMethod}</p>
            <p className="text-emerald-400 font-semibold">Payment Status: Authorized & Verified</p>
            <p className="text-[11px] text-slate-500">Transaction recorded in BUYGEN marketplace ledger.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
