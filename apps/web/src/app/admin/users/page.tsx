'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface UserData {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  role: 'CUSTOMER' | 'SUPPORT' | 'MANAGER' | 'OWNER';
  notes?: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function UserRolesPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch {
      setMessage({ type: 'error', text: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:4000/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `User role updated to ${newRole}.` });
        fetchUsers();
      } else {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to update role.');
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
            User Roles &amp; Staff Access Governance
          </h1>
          <p className="text-xs text-slate-400">Assign role-based permissions (Support, Manager, Owner). System enforces last Owner safeguard.</p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center space-x-2 p-4 rounded-xl text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">User Name</th>
              <th className="py-3.5 px-4">Email Address</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4">Orders Placed</th>
              <th className="py-3.5 px-4 text-right">Assigned Staff Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                  <span>{u.name || 'Anonymous User'}</span>
                  {u.role === 'OWNER' && <ShieldCheck className="w-4 h-4 text-amber-400" />}
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-bold">{u._count?.orders ?? 0}</td>
                <td className="py-3 px-4 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="CUSTOMER">CUSTOMER (Storefront Buyer)</option>
                    <option value="SUPPORT">SUPPORT (Orders &amp; Invoices Only)</option>
                    <option value="MANAGER">MANAGER (Products, Stock, Banners, Discounts)</option>
                    <option value="OWNER">OWNER (Full Admin &amp; Role Access)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
