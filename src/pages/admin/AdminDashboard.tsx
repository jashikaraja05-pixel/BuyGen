import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  TrendingUp,
  FolderTree
} from 'lucide-react';
import { AdminMetrics, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminDashboardProps {
  setAdminTab: (tab: any) => void;
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setAdminTab, navigate }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAdminMetrics()
      .then(res => setMetrics(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-amber-600 animate-pulse">Calculating real-time database metrics...</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
          Admin Performance Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Live statistics computed directly from PostgreSQL / persistent Firestore collections.
        </p>
      </div>

      {/* Top 5 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl text-slate-900">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Store sales volume</span>
          </p>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => setAdminTab('orders')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl text-slate-900">
            {metrics.totalOrders}
          </h3>
          <p className="text-[11px] text-slate-500">
            Customer shipments
          </p>
        </div>

        {/* Active Products */}
        <div 
          onClick={() => setAdminTab('products')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-cyan-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-cyan-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Products</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl text-slate-900">
            {metrics.totalProducts}
          </h3>
          <p className="text-[11px] text-slate-500">
            Live catalog items
          </p>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => setAdminTab('users')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-purple-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl text-slate-900">
            {metrics.totalUsers}
          </h3>
          <p className="text-[11px] text-purple-700 font-semibold">
            Customers & admins
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => setAdminTab('products')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-heading font-black text-2xl text-amber-600">
            {metrics.lowStockCount}
          </h3>
          <p className="text-[11px] text-amber-700 font-semibold">
            Stock ≤ 10 units
          </p>
        </div>

      </div>

      {/* Category Breakdown & Revenue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-600" />
            <span>Catalog Distribution by Category</span>
          </h2>
          <button
            onClick={() => setAdminTab('categories')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            Manage Categories
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {metrics.categoryBreakdown.map((item) => (
            <div key={item.category} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.category}</span>
              <p className="text-[11px] text-slate-500">{item.count} items active</p>
              <p className="text-xs font-mono font-bold text-indigo-700 pt-1">
                ₹{item.revenue.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Recent Orders</span>
          </h2>
          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            View All ({metrics.totalOrders})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Payment</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-2 font-mono font-bold text-indigo-600">{order.id}</td>
                  <td className="py-3 px-2 text-slate-900">{order.customerName}</td>
                  <td className="py-3 px-2 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-2 font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-2 text-slate-500 text-xs">{order.paymentMethod}</td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
