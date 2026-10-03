import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  CreditCard,
  ShieldCheck, 
  LogOut, 
  Store,
  Lock,
  Mail,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminLayoutProps {
  currentAdminTab: 'dashboard' | 'products' | 'categories' | 'offers' | 'orders' | 'users' | 'payments';
  setAdminTab: (tab: 'dashboard' | 'products' | 'categories' | 'offers' | 'orders' | 'users' | 'payments') => void;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  currentAdminTab, 
  setAdminTab, 
  navigate, 
  children 
}) => {
  const { user, isAdmin, login, logout } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // If not logged in as Admin, show dedicated Admin Portal Login Gate
  if (!user || !isAdmin) {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminEmail.trim() || !adminPassword) {
        setAuthError('Please enter your administrator email and password.');
        return;
      }
      try {
        setLoggingIn(true);
        setAuthError(null);
        await login(adminEmail.trim(), adminPassword);
      } catch (err: any) {
        setAuthError(err.message || 'Admin authentication failed');
      } finally {
        setLoggingIn(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#070814] text-white flex flex-col justify-between p-4 sm:p-8">
        {/* Top bar back to store */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img 
              src="/buygen-logo.jpg" 
              alt="BUYGEN" 
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/20" 
            />
            <div>
              <span className="font-heading font-black text-xl text-white">
                BUY<span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">GEN</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400 block tracking-wider uppercase">
                Consumer Electronics Store Manager
              </span>
              <span className="text-[9px] font-semibold text-slate-400 block">
                Official Admin Console
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Store className="w-4 h-4 text-cyan-400" />
            <span>Switch to Customer Store</span>
          </button>
        </div>

        {/* Login Gate Card */}
        <div className="max-w-md w-full mx-auto my-12 bg-[#0b0e24] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-black text-2xl text-white">
              Administrator Console
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with administrative credentials to manage store inventory, real products, and customer orders.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@buygen.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
                <Mail className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
                <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In as Store Administrator'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600">
          BUYGEN Consumer Electronics Store Manager Console
        </p>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Inventory', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'offers', label: 'Offers & Banners', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'payments', label: 'Payments & QR', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#070814] text-white flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#090b1c] text-white shrink-0 p-6 flex flex-col justify-between border-r border-slate-800/90 shadow-2xl">
        <div className="space-y-8">
          
          {/* Admin Header & Switcher */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/buygen-logo.jpg" 
                alt="BUYGEN" 
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/20" 
              />
              <div>
                <span className="font-heading font-black text-lg text-white">
                  BUY<span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">GEN</span>
                </span>
                <span className="block text-[10px] font-bold tracking-wider uppercase text-amber-400">
                  Consumer Electronics
                </span>
                <span className="block text-[9px] font-semibold text-slate-400">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Quick Switch to Customer Store */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>← Customer Store</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAdminTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="px-1 text-[11px] text-slate-400">
            <span className="block text-slate-500">Admin Account:</span>
            <span className="font-bold text-amber-300 block truncate">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">{user.email}</span>
          </div>

          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-rose-950/50 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 bg-[#070814]">
        {/* Admin Top Header Bar */}
        <div className="bg-[#0b0e24] rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <div>
              <h2 className="font-heading font-black text-white text-lg capitalize">
                {currentAdminTab} Management
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                BUYGEN Consumer Electronics Store Manager • Live Database Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Catalog View</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        {children}
      </main>

    </div>
  );
};
