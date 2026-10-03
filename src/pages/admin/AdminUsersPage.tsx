import React, { useEffect, useState } from 'react';
import { Users, Mail, ShieldCheck, UserCheck, Calendar, ShoppingBag } from 'lucide-react';
import type { User } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<(User & { orderCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminUsers()
      .then(res => setUsers(res.users || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 text-white">
      
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Registered customers and administrators stored in the persistent database. Passwords are securely hashed.
        </p>
      </div>

      <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Orders Placed</th>
                <th className="py-3.5 px-6">Member Since</th>
                <th className="py-3.5 px-6">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-200">
                    {u.orderCount} orders
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Active</span>
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
