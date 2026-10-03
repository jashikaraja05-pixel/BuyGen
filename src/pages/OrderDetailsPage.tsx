import React, { useEffect, useState } from 'react';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Check, 
  Clock, 
  ChevronLeft,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface OrderDetailsPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, navigate }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await api.getOrderById(orderId);
        setOrder(res.order);
      } catch (err: any) {
        setError(err.message || 'Could not load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, user, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-indigo-600 animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-slate-900">Order Not Available</h2>
        <p className="text-xs text-slate-500">{error || 'This order does not exist or you do not have permission to view it.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
              Order {order.id}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
          {order.status}
        </span>
      </div>

      {/* Status Flow Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-heading font-bold text-base text-slate-900">
          Order Status Tracker
        </h2>

        <div className="relative flex items-center justify-between">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
          ></div>

          {statuses.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                    isCompleted 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' 
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-bold mt-2 whitespace-nowrap ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 italic text-center pt-2">
          Note: Customers cannot manually alter order status. Status updates are processed exclusively by BUYGEN warehouse administrators.
        </p>
      </div>

      {/* Ordered Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-heading font-bold text-base text-slate-900">
          Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
        </h2>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.productId} className="py-4 flex items-center justify-between gap-4">
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/products/${item.productId}`)}
              >
                <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</span>
                  <h4 className="font-heading font-bold text-sm text-slate-900 hover:text-indigo-600 transition">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <span className="font-heading font-bold text-base text-slate-900 whitespace-nowrap">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>₹{(order.subtotal + order.discount).toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discounts Applied</span>
              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Express Shipping</span>
            <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between font-heading font-bold text-base text-slate-900">
            <span>Total Amount</span>
            <span className="text-indigo-600 font-black text-2xl">₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Address & Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-slate-900">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Shipping Address</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-slate-900">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Payment Simulation</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">{order.paymentMethod}</p>
            <p className="text-emerald-600 font-semibold">Payment Status: Authorized</p>
            <p className="text-[11px] text-slate-400">Simulated transaction recorded in BUYGEN ledger.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
