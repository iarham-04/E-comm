'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IndianRupee, ShoppingCart, Package, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { adminFetch } from '@/lib/adminApi';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  lowStockProducts: { id: string; name: string; slug: string; stock: number; price: number | string }[];
  recentOrders: { id: string; total: number | string; status: string; createdAt: string; guestEmail?: string; user?: { name?: string; email?: string } }[];
}

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-neutral-100 text-neutral-700 border border-neutral-300',
  CONFIRMED: 'bg-blue-100 text-blue-900 border border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-900 border border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  CANCELLED: 'bg-rose-100 text-rose-900 border border-rose-300',
};

const inr = (n: number | string) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminFetch(`${API_URL}/admin/dashboard`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const lowStock = data?.lowStockProducts ?? [];
  const metrics = [
    { label: 'Paid Revenue', value: data ? inr(data.totalRevenue) : '—', icon: IndianRupee, tone: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { label: 'Total Orders', value: data?.totalOrders ?? '—', icon: ShoppingCart, tone: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Products', value: data?.totalProducts ?? '—', icon: Package, tone: 'bg-neutral-50 border-neutral-200 text-neutral-700' },
    { label: 'Customers', value: data?.totalUsers ?? '—', icon: Users, tone: 'bg-sky-50 border-sky-200 text-sky-700' },
    {
      label: 'Low Stock (≤5)',
      value: data ? lowStock.length : '—',
      icon: AlertTriangle,
      tone: lowStock.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Sales, orders and inventory at a glance</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-[#fafafa] text-neutral-700 rounded-xl border border-neutral-200 shadow-xs transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/admin/products/new" className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all">
            + Add Product
          </Link>
          <Link href="/admin/orders" className="bg-white hover:bg-[#fafafa] text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-200 shadow-xs transition">
            Manage Orders
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-4">
          Could not load dashboard data. Check your connection and click refresh.
        </p>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{label}</span>
              <div className={`p-1.5 rounded-lg border ${tone}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-neutral-900">{loading && !data ? '…' : value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">Low Stock Products</h2>
          <Link href="/admin/inventory" className="text-xs font-bold text-neutral-600 hover:underline">Update Inventory →</Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-xs text-neutral-500">{data ? 'All products have more than 5 units in stock.' : '—'}</p>
        ) : (
          <div className="space-y-2.5">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[#fafafa] border border-neutral-100">
                <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-bold text-neutral-900 hover:underline line-clamp-1">{p.name}</Link>
                <span className={`text-xs font-black ml-4 ${p.stock === 0 ? 'text-rose-700' : 'text-amber-700'}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-neutral-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-neutral-600 hover:underline">View All Orders →</Link>
        </div>
        {!data?.recentOrders?.length ? (
          <p className="text-xs text-neutral-500">{data ? 'No orders yet.' : '—'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafa] border-b border-neutral-200 text-neutral-600 uppercase font-bold tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="p-3 font-mono font-bold text-neutral-700">#{o.id.slice(-6).toUpperCase()}</td>
                    <td className="p-3 font-semibold text-neutral-900">{o.user?.name || o.user?.email || o.guestEmail || 'Guest'}</td>
                    <td className="p-3 font-bold text-neutral-900">{inr(o.total)}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[o.status] || 'bg-neutral-100 text-neutral-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
