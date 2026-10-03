import React, { useEffect, useState } from 'react';
import { Package, ChevronRight, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface OrdersPageProps {
  navigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await api.getOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-800 border border-purple-200">Processing</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">Shipped</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-indigo-600 animate-pulse">Loading order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-slate-900">No Orders Yet</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          You haven't placed any electronic orders yet. Explore our product catalog or ask our AI Tech Advisor!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="font-heading font-black text-3xl text-slate-900">
          Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your past electronics purchases and track ongoing deliveries.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                {getStatusBadge(order.status)}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Items thumbnails preview */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                    <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="font-heading font-black text-lg text-slate-900">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
