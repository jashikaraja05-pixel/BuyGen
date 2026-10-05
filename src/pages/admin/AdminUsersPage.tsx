import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  ShoppingBag, 
  Search, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  RotateCw,
  ExternalLink,
  X
} from 'lucide-react';
import type { User, Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<(User & { orderCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User Orders Modal
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getAdminUsers();
      setUsers(res.users || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (targetUser: User, newRole: 'customer' | 'admin') => {
    if (targetUser.id === currentAdmin?.id && newRole !== 'admin') {
      alert('You cannot remove administrator privileges from your own active account.');
      return;
    }

    const actionText = newRole === 'admin' 
      ? `Promote "${targetUser.name}" (${targetUser.email}) to Store Administrator? This grants complete access to the Admin Dashboard.`
      : `Demote "${targetUser.name}" (${targetUser.email}) to Customer? They will no longer have access to the Admin Dashboard.`;

    if (!window.confirm(actionText)) {
      return;
    }

    try {
      setUpdatingId(targetUser.id);
      setErrorMsg(null);
      const res = await api.updateUserRole(targetUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      setSuccessMsg(res.message || `User role updated to ${newRole}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewUserOrders = async (u: User) => {
    setSelectedUserForOrders(u);
    setLoadingUserOrders(true);
    try {
      const res = await api.getOrders();
      const allOrders = res.orders || [];
      const filtered = allOrders.filter(o => o.userId === u.id || o.customerEmail?.toLowerCase() === u.email.toLowerCase());
      setUserOrders(filtered);
    } catch (err) {
      console.error(err);
      setUserOrders([]);
    } finally {
      setLoadingUserOrders(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'customer') return u.role === 'customer';
    if (roleFilter === 'admin') return u.role === 'admin';
    return true;
  });

  return (
    <div className="space-y-6 text-white">
      
      {/* Header Card */}
      <div className="bg-[#0b0e24] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
              Access Control & User Registry
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified Database Roles
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            User Management & Role Assignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            View registered store customers and system administrators. Roles are authoritative, stored in Firestore, and verified on every backend request.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-[#0b0e24] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold">Filter Role:</span>
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                roleFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                roleFilter === 'customer' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Customers ({users.filter(u => u.role === 'customer').length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                roleFilter === 'admin' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admins ({users.filter(u => u.role === 'admin').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">User Profile</th>
                <th className="py-3.5 px-6">Role & Permissions</th>
                <th className="py-3.5 px-6">Orders Placed</th>
                <th className="py-3.5 px-6">Registration Date</th>
                <th className="py-3.5 px-6 text-right">Role Escalation / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentAdmin?.id;
                  const isUpdating = updatingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-sm">{u.name}</p>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                            <span className="text-[9px] text-slate-500 font-mono block">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                          u.role === 'admin' 
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' 
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {u.role === 'admin' ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>Store Administrator</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Customer</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleViewUserOrders(u)}
                          className="font-bold text-slate-200 hover:text-cyan-300 flex items-center gap-1.5 text-xs transition cursor-pointer"
                          title="Click to view user orders"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.orderCount} {u.orderCount === 1 ? 'order' : 'orders'}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </button>
                      </td>

                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-slate-500 italic">
                            Current Session
                          </span>
                        ) : u.role === 'customer' ? (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleRoleChange(u, 'admin')}
                            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isUpdating ? 'Updating...' : 'Promote to Admin'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleRoleChange(u, 'customer')}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isUpdating ? 'Updating...' : 'Demote to Customer'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Orders Modal */}
      {selectedUserForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0b0e24] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-sm">
                  {selectedUserForOrders.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-white">
                    Order History: {selectedUserForOrders.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedUserForOrders.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForOrders(null)}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingUserOrders ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading order history...</span>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No orders placed yet by this user.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400">{ord.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-white text-xs font-mono">
                        ₹{ord.total?.toLocaleString('en-IN')} ({ord.paymentMethod?.toUpperCase()})
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="truncate">
                          • {it.name || it.productId} (x{it.quantity})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForOrders(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
