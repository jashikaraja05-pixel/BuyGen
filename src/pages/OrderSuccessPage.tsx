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
  ShieldCheck,
  ShoppingBag
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
    // Celebratory confetti on order placement
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored
    }

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
        <p className="text-sm font-semibold text-cyan-400 animate-pulse">Loading verified order record...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 text-white">
        <h2 className="font-heading font-bold text-2xl text-white">Order Record Not Found</h2>
        <p className="text-xs text-slate-400">We could not locate this order record.</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-white">
      
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Order Successfully Placed
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
          Thank you for shopping at BUYGEN!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Your order has been recorded into the live database and warehouse stock has been deducted.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Order Details Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 font-medium block">Order Reference ID</span>
            <span className="font-mono font-bold text-cyan-300 text-base">{order.id}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Order Date</span>
            <span className="font-semibold text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Payment Method</span>
            <span className="font-semibold text-white">{order.paymentMethod}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Current Status</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-white">Items Ordered</h3>
          <div className="divide-y divide-slate-800/80">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 truncate">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-xs sm:text-sm text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className="font-heading font-bold text-xs sm:text-sm text-white whitespace-nowrap">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>₹{(order.subtotal + (order.discount || 0)).toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Store Discount</span>
              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-400">
            <span>Delivery Fee</span>
            <span className="text-emerald-400 font-bold">FREE</span>
          </div>
          <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline font-bold text-base text-white">
            <span>Total Paid</span>
            <span className="font-heading font-black text-xl text-cyan-300">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Shipping Address snippet */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="font-bold text-white block">Delivery Destination:</span>
          <p>{order.customerName} • {order.customerPhone}</p>
          <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition"
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Track in My Orders</span>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 flex items-center gap-2 cursor-pointer transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
