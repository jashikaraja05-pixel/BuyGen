import React from 'react';
import { User as UserIcon, Mail, ShieldCheck, Calendar, Package, Heart, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-heading font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl text-slate-900">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div 
          onClick={() => navigate('/orders')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer shadow-xs space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">Order History</h3>
          <p className="text-xs text-slate-500">Track shipments & view invoices</p>
        </div>

        <div 
          onClick={() => navigate('/wishlist')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer shadow-xs space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">Saved Wishlist</h3>
          <p className="text-xs text-slate-500">{wishlistCount} gadgets saved</p>
        </div>

        {isAdmin ? (
          <div 
            onClick={() => navigate('/admin')}
            className="bg-gradient-to-tr from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200/80 hover:border-amber-300 transition cursor-pointer shadow-xs space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-amber-900">Admin Console</h3>
            <p className="text-xs text-amber-700 font-medium">Manage catalog, orders & metrics</p>
          </div>
        ) : (
          <div 
            onClick={() => navigate('/advisor')}
            className="bg-gradient-to-tr from-indigo-50 to-cyan-50 p-6 rounded-2xl border border-indigo-200/80 hover:border-indigo-300 transition cursor-pointer shadow-xs space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-indigo-900">AI Tech Advisor</h3>
            <p className="text-xs text-indigo-700 font-medium">Get customized gadget recommendations</p>
          </div>
        )}

      </div>

      {/* Account Info Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-heading font-bold text-lg text-slate-900">
          Account Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <span className="font-semibold text-slate-400 block mb-1">User Identifier</span>
            <span className="font-mono font-bold text-slate-800">{user.id}</span>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-1">Registered Email</span>
            <span className="font-bold text-slate-800">{user.email}</span>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-1">Account Role</span>
            <span className="font-bold text-indigo-600 uppercase tracking-wide">{user.role}</span>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-1">Member Since</span>
            <span className="font-bold text-slate-800">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
