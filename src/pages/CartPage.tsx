import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { items, itemCount, subtotal, discount, total, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5 text-white">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-lg">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-white">Please Sign In to Access Your Cart</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Your shopping cart persists securely in our database across devices once signed in.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5 text-white">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto shadow-xl">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="font-heading font-black text-2xl text-white">Your Cart is Currently Empty</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Discover high-performance flagships, ultrabooks, and studio audio ready to dispatch.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            Explore Electronics
          </button>
          <button
            onClick={() => navigate('/advisor')}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Tech Advisor</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-heading font-black text-3xl text-white">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout.
          </p>
        </div>

        <button
          onClick={() => clearCart()}
          className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="p-4 sm:p-5 bg-[#0b0e24] rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/products/${item.productId}`)}
              >
                <div className="w-20 h-20 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.brand}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-white line-clamp-1 hover:text-cyan-400 transition">
                    {item.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading font-bold text-base text-white">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-slate-500 line-through">
                        ₹{item.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                    In Stock ({item.stock} available)
                  </span>
                </div>
              </div>

              {/* Quantity controls & Remove */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-950">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-2 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-white block">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

            </div>
          ))}

          {/* Continue shopping button */}
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 pt-2 cursor-pointer"
          >
            <span>← Continue Shopping for Electronics</span>
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-6 sticky top-28">
          <h2 className="font-heading font-bold text-lg text-white">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-white">₹{(subtotal + discount).toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Product Discounts</span>
                <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-300">
              <span>Express Insured Shipping</span>
              <span className="font-semibold text-emerald-400 uppercase text-xs">FREE</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
              <span className="font-heading font-bold text-base text-white">Total Payable</span>
              <span className="font-heading font-black text-2xl text-cyan-300">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-[11px] text-cyan-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Official checkout portal. Supports UPI QR Code, Cash on Delivery (COD), and Card verification.</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-heading font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Micro assurances */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Free express transit nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine manufacturer warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>7-Day easy replacement guarantee</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
