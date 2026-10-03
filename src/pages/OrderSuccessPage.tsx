import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { Order } from '../types/index.ts';
import { api } from '../services/api.ts';

interface OrderSuccessPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Blast celebratory confetti on successful order creation!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.getOrderById(orderId);
        setOrder(res.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-sm font-semibold text-indigo-600 animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">We could not locate this order record.</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Go to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Order Successfully Placed
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
          Thank you for choosing BUYGEN!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your order has been recorded into the persistent database and scheduled for express dispatch.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Order Details Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 font-medium block">Order Reference</span>
            <span className="font-mono font-bold text-slate-900 text-base">{order.id}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Order Date</span>
            <span className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Payment Method</span>
            <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Current Status</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900">Items Ordered</h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 truncate">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>₹{(order.subtotal + order.discount).toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between font-heading font-bold text-base text-slate-900">
            <span>Total Paid</span>
            <span className="text-indigo-600 font-black text-xl">₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-xs sm:text-sm text-slate-600">
          <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</span>
            <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>

      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>View in Order History</span>
        </button>

        <button
          onClick={() => navigate('/products')}
          className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
