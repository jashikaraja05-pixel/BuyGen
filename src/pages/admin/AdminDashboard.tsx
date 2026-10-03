import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Package, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { AdminMetrics, SearchLog, UserLoginLog, User } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminDashboardProps {
  setAdminTab: (tab: any) => void;
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setAdminTab, navigate }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [searches, setSearches] = useState<SearchLog[]>([]);
  const [logins, setLogins] = useState<UserLoginLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, searchRes, loginRes, usersRes] = await Promise.allSettled([
        api.getAdminMetrics(),
        api.getAdminSearches(),
        api.getAdminLogins(),
        api.getAdminUsers()
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value) {
        setMetrics(metricsRes.value);
        if (metricsRes.value.searchLogs) {
          setSearches(metricsRes.value.searchLogs);
        }
        if (metricsRes.value.recentLogins) {
          setLogins(metricsRes.value.recentLogins);
        }
        if (metricsRes.value.users) {
          setUsersList(metricsRes.value.users);
        }
      }

      if (searchRes.status === 'fulfilled' && searchRes.value?.searches) {
        setSearches(searchRes.value.searches);
      }

      if (loginRes.status === 'fulfilled' && loginRes.value?.logins) {
        setLogins(loginRes.value.logins);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        setUsersList(usersRes.value.users);
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const filteredSearches = searches.filter(s => 
    s.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.userEmail.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalUsersCount = metrics?.totalUsers || (usersList.length > 0 ? usersList.length : logins.length);
  const totalSearchesCount = metrics?.totalSearches || searches.length;
  const totalProductsCount = metrics?.totalProducts || 0;

  return (
    <div className="space-y-8">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-black uppercase tracking-wider">
              Store Monitoring Dashboard
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Connected
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950">
            User Logins & Search Activity
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time tracking of authenticated user sessions and customer search terms in BUYGEN Consumer Electronics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Active Database Statistics: Products, Categories, Orders, Users, Searches */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Active Products */}
        <div 
          onClick={() => setAdminTab('products')}
          className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-1.5 hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-950">
            {loading ? '...' : (metrics?.totalProducts ?? 0)}
          </h3>
          <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{(metrics?.totalProducts ?? 0) === 0 ? '0 added by admin' : 'Items in database'}</span>
          </p>
        </div>

        {/* Active Categories */}
        <div 
          onClick={() => setAdminTab('categories')}
          className="bg-white p-5 rounded-3xl border-2 border-blue-100 shadow-sm space-y-1.5 hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Active Categories
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-blue-600">
              <Filter className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-950">
            {loading ? '...' : (metrics?.totalCategories ?? 0)}
          </h3>
          <p className="text-[11px] text-blue-800 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{(metrics?.totalCategories ?? 0) === 0 ? '0 added by admin' : 'Catalog categories'}</span>
          </p>
        </div>

        {/* Active Customer Orders */}
        <div 
          onClick={() => setAdminTab('orders')}
          className="bg-white p-5 rounded-3xl border-2 border-amber-100 shadow-sm space-y-1.5 hover:border-amber-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center font-bold text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-950">
            {loading ? '...' : (metrics?.totalOrders ?? 0)}
          </h3>
          <p className="text-[11px] text-amber-800 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{(metrics?.totalOrders ?? 0) === 0 ? '0 placed by users' : 'Customer orders'}</span>
          </p>
        </div>

        {/* Total Logged In Users */}
        <div 
          onClick={() => setAdminTab('users')}
          className="bg-white p-5 rounded-3xl border-2 border-indigo-100 shadow-sm space-y-1.5 hover:border-indigo-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Users Logged In
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-950">
            {loading ? '...' : totalUsersCount}
          </h3>
          <p className="text-[11px] text-indigo-700 font-bold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Authenticated accounts</span>
          </p>
        </div>

        {/* Customer Searches Performed */}
        <div className="bg-white p-5 rounded-3xl border-2 border-cyan-100 shadow-sm space-y-1.5 hover:border-cyan-400 transition">
          <div className="flex items-center justify-between text-cyan-700">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Customer Searches
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center font-bold text-cyan-600">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-950">
            {loading ? '...' : totalSearchesCount}
          </h3>
          <p className="text-[11px] text-cyan-800 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Search keywords logged</span>
          </p>
        </div>

      </div>

      {/* Zero Active Products Guidance Notice */}
      {!loading && (metrics?.totalProducts ?? 0) === 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">0 Active Products in Database</span>
              <span className="text-amber-700">All hardcoded mock data has been removed. Products will appear here and in the store as soon as they are added by an administrator.</span>
            </div>
          </div>
          <button
            onClick={() => setAdminTab('products')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 cursor-pointer transition"
          >
            Add First Product
          </button>
        </div>
      )}

      {/* SECTION 1: Who Logged In (User Login Activity) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-black text-lg text-slate-950">
                Who Logged In (User Login History)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              List of users and administrators who have logged into the application.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-black border border-indigo-200">
            {logins.length} Active Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          {logins.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No User Logins Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                User logins will be recorded and displayed here as customers and administrators authenticate.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Login Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logins.map((entry) => {
                  const isAdmin = entry.role === 'admin';
                  const dateStr = new Date(entry.loginTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          }`}>
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{entry.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {entry.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-700 text-xs font-semibold">
                        {entry.email}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${
                          isAdmin 
                            ? 'bg-amber-50 text-amber-950 border-amber-300' 
                            : 'bg-indigo-50 text-indigo-950 border-indigo-200'
                        }`}>
                          {entry.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-black text-lg text-slate-950">
                What Users Searched For (Customer Searches Log)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live record of electronic products and queries searched by visitors and registered users.
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
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 w-52 bg-white"
              />
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-900 text-xs font-black border border-cyan-200">
              {filteredSearches.length} Queries
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {searches.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Customer Searches Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When customers type in the search bar (e.g., "phone", "laptop", "monitor"), their search keywords will be logged and listed here in real time.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Searched Query</th>
                  <th className="py-3.5 px-6">Searched By</th>
                  <th className="py-3.5 px-6">Search Time</th>
                  <th className="py-3.5 px-6 text-right">Catalog Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSearches.map((item) => {
                  const dateStr = new Date(item.timestamp).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-cyan-400 font-mono font-bold text-xs shadow-xs border border-slate-800">
                            "{item.query}"
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.userName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{item.userEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          item.resultsCount > 0 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
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
