import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Package, 
  Heart, 
  LogOut, 
  MapPin, 
  Truck, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { api } from '../services/api.ts';
import type { Order } from '../types/index.ts';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.getOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* 1. Header Profile Card in BUYGEN Logo Theme */}
      <div className="bg-[#0b0e24] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 text-slate-950 font-heading font-black text-3xl flex items-center justify-center shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/40">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user.email}</span>
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          )}

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Access Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => navigate('/orders')}
          className="bg-[#0c0f26] p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 transition cursor-pointer shadow-lg space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-xl text-white group-hover:text-cyan-300 transition">
              {orders.length}
            </span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white group-hover:text-cyan-400 transition">My Orders</h3>
            <p className="text-[11px] text-slate-400">Track shipments & past purchases</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/wishlist')}
          className="bg-[#0c0f26] p-5 rounded-2xl border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/60 transition cursor-pointer shadow-lg space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-xl text-white group-hover:text-rose-300 transition">
              {wishlistCount}
            </span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white group-hover:text-rose-400 transition">Saved Wishlist</h3>
            <p className="text-[11px] text-slate-400">Electronics bookmarked for later</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/cart')}
          className="bg-[#0c0f26] p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 transition cursor-pointer shadow-lg space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Checkout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white group-hover:text-indigo-300 transition">Shopping Bag</h3>
            <p className="text-[11px] text-slate-400">View active cart items</p>
          </div>
        </div>

      </div>

      {/* 3. My Orders Section directly in Profile as requested */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-heading font-black text-lg sm:text-xl text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              <span>My Orders & Placed Shipments</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status, tracking information, and invoices for your customer orders
            </p>
          </div>

          {orders.length > 0 && (
            <button
              onClick={() => navigate('/orders')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Full Orders View</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                You haven't placed any electronics orders yet. Explore our genuine catalog to purchase flagship tech.
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const isDelivered = order.status === 'Delivered';

              return (
                <div 
                  key={order.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-cyan-300">
                        #{order.id}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isDelivered 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-200">
                        {order.items.map(i => i.name).join(', ')}
                      </p>
                      <span className="text-[11px] text-slate-500 font-mono">({totalItems} items)</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        <span className="uppercase">{order.paymentMethod}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800 gap-2">
                    <span className="font-heading font-black text-base sm:text-lg text-white">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {orders.length > 5 && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  View All {orders.length} Orders →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Account Specifications in Theme */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-cyan-400" />
          <span>Account Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-medium text-slate-500 block mb-1">User Identifier</span>
            <span className="font-mono font-bold text-slate-200 truncate block">{user.id}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-medium text-slate-500 block mb-1">Registered Email</span>
            <span className="font-mono font-bold text-cyan-300 truncate block">{user.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-medium text-slate-500 block mb-1">Account Role</span>
            <span className={`font-black uppercase tracking-wider ${user.role === 'admin' ? 'text-amber-400' : 'text-cyan-400'}`}>
              {user.role}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="font-medium text-slate-500 block mb-1">Security Status</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Session</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
