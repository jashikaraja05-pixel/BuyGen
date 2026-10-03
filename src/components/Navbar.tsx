import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal, 
  LogOut, 
  Package, 
  Store,
  ChevronDown,
  Cpu,
  Smartphone,
  Laptop,
  Headphones,
  Monitor,
  Keyboard,
  Volume2,
  Watch,
  Camera,
  Home,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';

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

  const categories = [
    { name: 'Smartphones', slug: 'smartphones', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Headphones', slug: 'headphones-earbuds', icon: '🎧' },
    { name: 'Monitors', slug: 'monitors', icon: '🖥️' },
    { name: 'Keyboards & Mouse', slug: 'keyboards-mouse', icon: '⌨️' },
    { name: 'Speakers', slug: 'speakers', icon: '🔊' },
    { name: 'Smartwatches', slug: 'smartwatches', icon: '⌚' },
    { name: 'Cameras', slug: 'cameras', icon: '📷' },
    { name: 'Smart Home', slug: 'smart-home', icon: '🏠' },
    { name: 'Accessories', slug: 'accessories', icon: '🔌' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isInAdmin = currentPath.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-[#090b1c]/95 backdrop-blur-md border-b border-slate-800/90 shadow-xl transition-all text-white">
      
      {/* 1. TOP PORTAL SWITCHER & SYSTEM STATUS BAR */}
      <div className="bg-[#05060f] text-slate-300 text-xs py-2 px-3 sm:px-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          
          {/* Dual Experience Mode Switcher (User Panel vs Admin Panel) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Select Panel:
            </span>
            
            <div className="inline-flex p-0.5 bg-slate-900 rounded-xl border border-slate-800">
              {/* User Panel (Customer Store) */}
              <button
                onClick={() => navigate('/')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  !isInAdmin 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Customer Store & User Panel"
              >
                <Store className="w-3.5 h-3.5" />
                <span>User Panel</span>
              </button>

              {/* Admin Panel */}
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isInAdmin 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/80'
                }`}
                title="Administrator Management Console"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden sm:inline-block"></span>
              </button>
            </div>
          </div>

          {/* Quick Info & User Status */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs">
            <button 
              onClick={() => navigate('/advisor')} 
              className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 font-bold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Tech Advisor</span>
            </button>

            <span className="text-slate-700 hidden md:inline">|</span>

            {/* Quick Login/Register Links in the top bar */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white font-semibold transition cursor-pointer"
                >
                  Log In
                </button>
                <span className="text-slate-700">•</span>
                <button
                  onClick={() => navigate('/register')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Signed in:</span>
                <span className="text-white font-bold">{user.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase ${
                  user.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, All Electronics Shortcut, Search, Actions & Auth) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo & All Electronics Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
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

            {/* Prominent "All Electronics" Touch Button */}
            <button
              onClick={() => navigate('/products')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition shadow-xs cursor-pointer flex items-center gap-2 ${
                currentPath === '/products'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/25 ring-2 ring-cyan-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 active:scale-95'
              }`}
              title="Browse All Electronics Catalog"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>⚡ All Electronics</span>
            </button>
          </div>

          {/* Search Bar with AI Ask */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search smartphones, 16GB laptops, ANC headphones, 4K monitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 pl-11 pr-24 py-2.5 rounded-full border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-xs sm:text-sm transition outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
              <button
                type="button"
                onClick={() => navigate('/advisor')}
                className="absolute right-2 top-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-semibold rounded-full hover:opacity-90 transition flex items-center gap-1 shadow-xs cursor-pointer"
                title="Ask BUYGEN AI Tech Advisor"
              >
                <Sparkles className="w-3 h-3" />
                AI Ask
              </button>
            </div>
          </form>

          {/* Action Icons (Compare, Wishlist, Cart) & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Compare */}
            <button
              onClick={() => navigate('/compare')}
              className={`p-2.5 rounded-full text-slate-300 hover:bg-slate-800/80 relative transition cursor-pointer ${
                compareProducts.length > 0 ? 'text-cyan-400 font-semibold' : ''
              }`}
              title="Compare Products"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {compareProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {compareProducts.length}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="p-2.5 rounded-full text-slate-300 hover:bg-slate-800/80 relative transition cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="p-2.5 rounded-full text-slate-300 hover:bg-slate-800/80 relative transition cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingCart className={`w-5 h-5 ${itemCount > 0 ? 'text-cyan-400' : ''}`} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Login & Register buttons */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-white max-w-[80px] truncate hidden sm:inline">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-[#0c0f24] rounded-2xl shadow-2xl border border-slate-700/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => navigate('/admin')}
                          className="w-full text-left px-4 py-2 text-sm text-amber-300 font-semibold hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Admin Panel
                        </button>
                      )}

                      <button
                        onClick={() => navigate('/orders')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders
                      </button>

                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Account Profile
                      </button>

                      <div className="border-t border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* 3. CATEGORY NAVIGATION STRIP (Always visible, scrollable horizontally with "All Electronics" & "Smartphones") */}
        <div className="flex items-center justify-between border-t border-slate-800/80 py-2.5 text-xs font-semibold text-slate-300 overflow-x-auto no-scrollbar scroll-smooth gap-3">
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Primary "All Electronics" pill */}
            <button
              onClick={() => navigate('/products')}
              className={`px-3 py-1.5 rounded-lg font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                currentPath === '/products' 
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>⚡ All Electronics</span>
            </button>

            {/* Category Buttons with Emojis */}
            {categories.map((c) => {
              const isSelected = currentPath === `/categories/${c.slug}`;
              return (
                <button
                  key={c.slug}
                  onClick={() => navigate(`/categories/${c.slug}`)}
                  className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected 
                      ? 'text-cyan-300 font-bold bg-slate-900 border border-cyan-500/50 shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/advisor')}
            className="hidden lg:flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-black whitespace-nowrap cursor-pointer shrink-0 ml-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Tech Advisor</span>
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          
          {/* Mobile Portal Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                !isInAdmin ? 'bg-indigo-600 text-white' : 'text-slate-700'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>User Panel</span>
            </button>
            <button
              onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                isInAdmin ? 'bg-amber-500 text-slate-950' : 'text-amber-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search gadgets, specs, price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-900 pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Quick All Electronics button */}
          <button
            onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            <Cpu className="w-4 h-4" />
            <span>⚡ View All Electronics</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { navigate('/advisor'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Tech Advisor
            </button>
            <button
              onClick={() => { navigate('/compare'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              Compare ({compareProducts.length})
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => { navigate(`/categories/${c.slug}`); setMobileMenuOpen(false); }}
                  className="text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium flex items-center gap-1.5"
                >
                  <span>{c.icon}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {!user ? (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="py-2.5 text-center font-bold text-xs bg-slate-100 rounded-xl"
              >
                Log In
              </button>
              <button
                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                className="py-2.5 text-center font-bold text-xs bg-indigo-600 text-white rounded-xl"
              >
                Register
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">{user.name}</strong> ({user.role})
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full py-2 text-center font-bold text-xs bg-rose-50 text-rose-600 rounded-xl"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}

    </header>
  );
};
