import React from 'react';
import { Cpu, Smartphone, ShoppingCart, Heart, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface FloatingDockProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ currentPath, navigate }) => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Hide dock if inside admin panel to keep admin workspace focused
  if (currentPath.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto px-2 py-1.5 rounded-full bg-[#070918]/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex items-center justify-between sm:justify-center gap-1 sm:gap-2">
      
      {/* 1. All Electronics button */}
      <button
        onClick={() => navigate('/products')}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          currentPath === '/products'
            ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
        }`}
        title="View All Electronics"
      >
        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
        <span className="whitespace-nowrap">All Electronics</span>
      </button>

      {/* 2. Smartphones button */}
      <button
        onClick={() => navigate('/categories/smartphones')}
        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
          currentPath === '/categories/smartphones'
            ? 'bg-indigo-600 text-white font-bold'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Smartphones Category"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline whitespace-nowrap">Smartphones</span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

      {/* 3. Cart button with live count */}
      <button
        onClick={() => navigate('/cart')}
        className={`p-2 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold transition relative flex items-center gap-1 cursor-pointer ${
          currentPath === '/cart'
            ? 'bg-indigo-600 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Shopping Cart (ஆட் கார்ட்)"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Cart</span>
        {itemCount > 0 && (
          <span className="sm:relative absolute -top-1 -right-1 sm:top-auto sm:right-auto bg-indigo-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* 4. Wishlist button with live count */}
      <button
        onClick={() => navigate('/wishlist')}
        className={`p-2 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold transition relative flex items-center gap-1 cursor-pointer ${
          currentPath === '/wishlist'
            ? 'bg-rose-600 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Wishlist (விஷ் லிஸ்ட்)"
      >
        <Heart className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden sm:inline">Wishlist</span>
        {wishlistCount > 0 && (
          <span className="sm:relative absolute -top-1 -right-1 sm:top-auto sm:right-auto bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-slate-800"></div>

      {/* 5. User Panel / Login */}
      {user ? (
        <button
          onClick={() => navigate('/profile')}
          className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
            currentPath === '/profile'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="User Profile"
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline truncate max-w-[70px]">{user.name}</span>
        </button>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
          title="Customer Login / Register"
        >
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span className="whitespace-nowrap">Login</span>
        </button>
      )}

      {/* 6. Admin Panel Shortcut */}
      <button
        onClick={() => navigate('/admin')}
        className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1 cursor-pointer active:scale-95"
        title="Access Admin Panel"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
        <span className="whitespace-nowrap">Admin</span>
      </button>

    </div>
  );
};
