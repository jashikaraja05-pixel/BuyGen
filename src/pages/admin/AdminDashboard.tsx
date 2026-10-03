import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Package, 
  ShoppingBag, 
  Clock, 
  Trash2, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import type { AdminMetrics, UserLoginLog, SearchLog } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminDashboardProps {
  setAdminTab: (tab: 'dashboard' | 'products' | 'categories' | 'orders' | 'users') => void;
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setAdminTab }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [logins, setLogins] = useState<UserLoginLog[]>([]);
  const [searches, setSearches] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearingLogins, setClearingLogins] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [metricsRes, loginsRes, searchesRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminLogins().catch(() => ({ logins: [] })),
        api.getSearchLogs().catch(() => ({ searches: [] }))
      ]);

      if (metricsRes) setMetrics(metricsRes);
      setLogins(loginsRes.logins || []);
      setSearches(searchesRes.searches || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleClearLogins = async () => {
    if (!window.confirm('Are you sure you want to delete all user login history logs? This cannot be undone.')) {
      return;
    }
    try {
      setClearingLogins(true);
      await api.clearAdminLogins();
      setLogins([]);
      if (metrics) {
        setMetrics({
          ...metrics,
          loggedInUsersCount: 0
        });
      }
    } catch (err) {
      console.error('Failed to clear login logs', err);
    } finally {
      setClearingLogins(false);
    }
  };

  const filteredSearches = searches.filter(s => 
    s.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.userEmail.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const loggedInUsersCount = metrics?.loggedInUsersCount ?? (new Set(logins.map(l => l.email.toLowerCase())).size);
  const totalSearchesCount = metrics?.totalSearches || searches.length;

  return (
    <div className="space-y-8 text-white">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b0e24] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
              Store Monitoring Dashboard
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Database Connected
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            User Logins & Search Activity
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of authenticated user sessions and customer search terms in BUYGEN Consumer Electronics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Active Database Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Active Products */}
        <div 
          onClick={() => setAdminTab('products')}
          className="bg-[#0b0e24] p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer shadow-lg space-y-1.5"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {loading ? '...' : (metrics?.totalProducts ?? 0)}
          </h3>
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{(metrics?.totalProducts ?? 0) === 0 ? '0 in catalog' : 'Items in database'}</span>
          </p>
        </div>

        {/* Active Categories */}
        <div 
          onClick={() => setAdminTab('categories')}
          className="bg-[#0b0e24] p-5 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer shadow-lg space-y-1.5"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Categories
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
              <Filter className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {loading ? '...' : (metrics?.totalCategories ?? 0)}
          </h3>
          <p className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Catalog categories</span>
          </p>
        </div>

        {/* Active Customer Orders */}
        <div 
          onClick={() => setAdminTab('orders')}
          className="bg-[#0b0e24] p-5 rounded-3xl border border-slate-800 hover:border-amber-500/50 transition cursor-pointer shadow-lg space-y-1.5"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {loading ? '...' : (metrics?.totalOrders ?? 0)}
          </h3>
          <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Customer orders</span>
          </p>
        </div>

        {/* Total Logged In Users */}
        <div 
          onClick={() => setAdminTab('users')}
          className="bg-[#0b0e24] p-5 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer shadow-lg space-y-1.5"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Users Logged In
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {loading ? '...' : loggedInUsersCount}
          </h3>
          <p className="text-[11px] text-indigo-300 font-bold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{loggedInUsersCount === 0 ? '0 active logins' : `${loggedInUsersCount} authenticated user${loggedInUsersCount > 1 ? 's' : ''}`}</span>
          </p>
        </div>

        {/* Customer Searches Performed */}
        <div className="bg-[#0b0e24] p-5 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Customer Searches
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {loading ? '...' : totalSearchesCount}
          </h3>
          <p className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Search terms logged</span>
          </p>
        </div>

      </div>

      {/* SECTION 1: Who Logged In (User Login Activity) */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#090b1c]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-black text-lg text-white">
                Who Logged In (User Login History)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live record of users and administrators authenticated in this session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-black border border-indigo-500/30">
              {logins.length} Active Sessions
            </span>
            {logins.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogins}
                disabled={clearingLogins}
                className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition cursor-pointer flex items-center gap-1.5"
                title="Delete all login history entries"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearingLogins ? 'Clearing...' : 'Clear History'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {logins.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-300">No User Logins Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                User logins will be recorded and displayed here as customers and administrators authenticate.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Login Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {logins.map((entry) => {
                  const isAdmin = entry.role === 'admin';
                  const dateStr = new Date(entry.loginTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={entry.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            isAdmin 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{entry.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">ID: {entry.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-cyan-300 text-xs font-semibold">
                        {entry.email}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${
                          isAdmin 
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {entry.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Authenticated
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 2: What Users Searched For (Search Activity Log) */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090b1c]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-black">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-black text-lg text-white">
                What Users Searched For (Customer Searches Log)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live record of electronic products and queries searched by visitors and customers.
            </p>
          </div>

          {/* Search Queries Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter search queries..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-700 rounded-xl focus:outline-hidden focus:border-cyan-400 w-52 bg-slate-950 text-white placeholder-slate-500"
              />
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-black border border-cyan-500/30">
              {filteredSearches.length} Queries
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {searches.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-300">No Customer Searches Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When customers type in the search bar (e.g., "phone", "laptop", "monitor"), their search keywords will be logged and listed here in real time.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Searched Query</th>
                  <th className="py-3.5 px-6">Searched By</th>
                  <th className="py-3.5 px-6">Search Time</th>
                  <th className="py-3.5 px-6 text-right">Catalog Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSearches.map((item) => {
                  const dateStr = new Date(item.timestamp).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30 shadow-xs">
                            "{item.query}"
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-white block">{item.userName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.userEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          item.resultsCount > 0 
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {item.resultsCount} {item.resultsCount === 1 ? 'item found' : 'items found'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
