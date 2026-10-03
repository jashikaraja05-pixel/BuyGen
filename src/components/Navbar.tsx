import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  SlidersHorizontal, 
  LogOut, 
  Package, 
  Store,
  ChevronDown,
  Info,
  Smartphone,
  Laptop,
  Headphones,
  Monitor,
  Keyboard,
  Volume2,
  Watch,
  Camera,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { AboutModal } from './AboutModal.tsx';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareProducts } = useCompare();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const categories = [
    { name: 'Smartphones', slug: 'smartphones', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Headphones', slug: 'headphones-earbuds', icon: '🎧' },
    { name: 'Monitors', slug: 'monitors', icon: '🖥️' },
    { name: 'Keyboards & Mouse', slug: 'keyboards-mouse', icon: '⌨️' },
    { name: 'Speakers', slug: 'speakers', icon: '🔊' },
    { name: 'Smartwatches', slug: 'smartwatches', icon: '⌚' },
    { name: 'Cameras', slug: 'cameras', icon: '📷' },
    { name: 'Smart Home', slug: 'smart-home', icon: '🏠' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090b1c]/95 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all text-white">
        
        {/* MAIN NAVBAR CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
            
            {/* 1. Official Logo & Brand */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden shrink-0"
            >
              <div className="relative">
                <img 
                  src="/buygen-logo.jpg" 
                  alt="BUYGEN" 
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-500/50 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition duration-300"
                />
                <span className="absolute -inset-0.5 rounded-xl bg-cyan-400/20 blur-xs -z-10 group-hover:opacity-100 opacity-60 transition"></span>
              </div>
              <div>
                <span className="font-heading font-black text-2xl tracking-tight text-white group-hover:text-cyan-400 transition">
                  BUY<span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">GEN</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-wider uppercase text-cyan-400/80 font-bold">
                  Next-Gen Electronics
                </span>
              </div>
            </button>

            {/* 2. Clean E-Commerce Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search smartphones, laptops, headphones, monitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 text-white pl-10 pr-10 py-2.5 rounded-full border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm transition outline-hidden placeholder:text-slate-500 shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* 3. Action Navigation (About, My Orders, Wishlist, Cart, Profile) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* About BUYGEN App Info */}
              <button
                type="button"
                onClick={() => setAboutOpen(true)}
                className="px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
                title="About BUYGEN Electronics"
              >
                <Info className="w-4 h-4 text-cyan-400" />
                <span className="hidden lg:inline">About</span>
              </button>

              {/* DIRECT VISIBLE: My Orders */}
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className={`px-3 py-2 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 ${
                  currentPath.startsWith('/orders')
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="View My Placed Orders"
              >
                <Package className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">My Orders</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => navigate('/wishlist')}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 relative transition cursor-pointer"
                title="Saved Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 relative transition cursor-pointer"
                title="Shopping Cart"
              >
                <ShoppingCart className={`w-4 h-4 ${itemCount > 0 ? 'text-cyan-400' : ''}`} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-white max-w-[90px] truncate hidden sm:inline">
                        {user.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-60 bg-[#0c0f24] rounded-2xl shadow-2xl border border-slate-700/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-2.5 border-b border-slate-800">
                          <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-cyan-400 font-mono truncate">{user.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {user.role}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="w-full text-left px-4 py-2 text-xs text-amber-300 font-bold hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            Admin Console
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => navigate('/orders')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Package className="w-4 h-4 text-indigo-400" />
                          My Orders
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate('/profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Profile Settings
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate('/wishlist')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Heart className="w-4 h-4 text-rose-400" />
                          Saved Wishlist
                        </button>

                        <div className="border-t border-slate-800 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer font-bold"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0c0f24] border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 shadow-2xl">
            {/* Search input in mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-white pl-9 pr-4 py-2 rounded-xl border border-slate-700 text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <div className="space-y-1 pt-2">
              <button
                type="button"
                onClick={() => { setAboutOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-cyan-300 flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                <span>About BUYGEN</span>
              </button>

              <button
                type="button"
                onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-indigo-400" />
                <span>My Orders</span>
              </button>

              <button
                type="button"
                onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-cyan-400" />
                <span>All Electronics Catalog</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-amber-300 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Management Console</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* About Modal */}
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        navigate={navigate}
      />
    </>
  );
};
