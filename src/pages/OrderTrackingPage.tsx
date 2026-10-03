import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Search, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Boxes
} from 'lucide-react';
import type { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { RealTimeOrderTracker } from '../components/RealTimeOrderTracker.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  navigate: (path: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderId, navigate }) => {
  const { user } = useAuth();
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user orders to offer quick 1-click selection
  useEffect(() => {
    const loadUserOrders = async () => {
      if (!user) return;
      try {
        const res = await api.getOrders();
        setUserOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load user orders', err);
      }
    };

    loadUserOrders();
  }, [user]);

  // Lookup order by ID
  const handleTrackSubmit = async (e?: React.FormEvent, directId?: string) => {
    if (e) e.preventDefault();
    const idToSearch = (directId || searchOrderId).trim();
    if (!idToSearch) {
      setError('Please enter an Order ID to track.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrderById(idToSearch);
      setSelectedOrder(res.order);
      setSearchOrderId(idToSearch);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check your Order ID.');
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleTrackSubmit(undefined, initialOrderId);
    } else if (userOrders.length > 0 && !selectedOrder) {
      // Auto-select first active order
      const firstActive = userOrders.find(o => o.status !== 'Delivered') || userOrders[0];
      handleTrackSubmit(undefined, firstActive.id);
    }
  }, [initialOrderId, userOrders.length]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Page Header */}
      <div className="bg-[#0b0e24] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>BUYGEN Logistics Express Tracking</span>
            <span>•</span>
            <span className="text-emerald-400">Live Telemetry</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Track Your Order Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Monitor verified delivery progress from warehouse packing to express doorstep handover.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>View All My Orders</span>
        </button>
      </div>

      {/* Order Search Box */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ord-m894..., or paste from receipt)"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl text-white text-xs sm:text-sm font-mono focus:outline-hidden placeholder:text-slate-500"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? 'Locating...' : 'Track Shipment'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick select recent customer orders */}
        {userOrders.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Select From Your Orders:
            </span>
            <div className="flex flex-wrap gap-2">
              {userOrders.slice(0, 5).map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleTrackSubmit(undefined, o.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer flex items-center gap-2 ${
                    searchOrderId === o.id
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-xs'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">#{o.id.slice(0, 10)}...</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                    o.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {o.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Tracking Visualizer */}
      {selectedOrder ? (
        <div className="space-y-6">
          <div className="bg-[#0b0e24] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <RealTimeOrderTracker order={selectedOrder} />
          </div>

          {/* Purchased Items Card */}
          <div className="bg-[#0b0e24] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-400" />
              <span>Consignment Packages ({selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'})</span>
            </h3>

            <div className="divide-y divide-slate-800">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950" 
                    />
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</span>
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{item.name}</h4>
                      {item.selectedColor && (
                        <span className="text-[10px] text-cyan-400">Color: {item.selectedColor}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block font-mono">Qty: {item.quantity}</span>
                    <span className="font-mono font-bold text-white text-xs sm:text-sm">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Consignment Value:</span>
              <span className="font-mono font-black text-base text-cyan-300">
                ₹{selectedOrder.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      ) : !loading ? (
        <div className="bg-[#0b0e24] p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-black text-lg text-white">Enter an Order ID to Track</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            View live checkpoints, shipment carrier details, and real-time status transitions.
          </p>
        </div>
      ) : null}

    </div>
  );
};
