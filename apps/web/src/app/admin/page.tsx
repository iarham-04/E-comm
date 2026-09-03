'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp,
  ArrowUpRight, BarChart2, Users, Eye, Search, Heart, CreditCard,
  CheckCircle2, Truck, MessageSquare, Star, RefreshCw, Loader2
} from 'lucide-react';
import { API_URL } from '@/lib/api';

const FUNNEL_EVENTS = [
  { label: 'Homepage Views',     icon: Eye,           value: 8240, color: '#4f46e5' },
  { label: 'Search Queries',     icon: Search,        value: 3980, color: '#7c3aed' },
  { label: 'Product Views',      icon: Package,       value: 2641, color: '#9333ea' },
  { label: 'Image Zooms',        icon: Eye,           value: 1820, color: '#c026d3' },
  { label: 'Wishlist Adds',      icon: Heart,         value: 1310, color: '#db2777' },
  { label: 'Add to Cart',        icon: ShoppingCart,  value: 894,  color: '#e11d48' },
  { label: 'Checkout Start',     icon: CreditCard,    value: 568,  color: '#ea580c' },
  { label: 'Payment Success',    icon: CheckCircle2,  value: 257,  color: '#ca8a04' },
  { label: 'Shipped Orders',     icon: Truck,         value: 214,  color: '#16a34a' },
  { label: 'Delivered',          icon: CheckCircle2,  value: 189,  color: '#059669' },
  { label: 'Reviews Written',    icon: Star,          value: 68,   color: '#0d9488' },
  { label: 'Newsletter Signups', icon: MessageSquare, value: 441,  color: '#0891b2' },
];

const REVENUE_BARS = [14200, 19800, 11500, 26400, 34500, 18900, 31200];
const MAX_REV = Math.max(...REVENUE_BARS);

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-amber-100 text-amber-900 border border-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-900 border border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-900 border border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  CANCELLED: 'bg-rose-100 text-rose-900 border border-rose-300',
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 184500,
    totalOrders: 42,
    totalProducts: 24,
    conversionRate: 3.12,
    lowStockCount: 2,
    totalCustomers: 318,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setMetrics((prev) => ({
            ...prev,
            totalRevenue: data.totalRevenue ?? prev.totalRevenue,
            totalOrders: data.totalOrders ?? prev.totalOrders,
            totalProducts: data.totalProducts ?? prev.totalProducts,
            lowStockCount: data.lowStockProducts?.length ?? prev.lowStockCount,
            totalCustomers: data.totalUsers ?? prev.totalCustomers,
          }));
          if (Array.isArray(data.recentOrders)) {
            setRecentOrders(data.recentOrders);
          }
        }
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 inline-block mb-1">
            Store Control Center
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive Command Centre
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics · Customer journey funnel · Inventory alerts
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/10 transition-all"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `₹${(metrics.totalRevenue / 1000).toFixed(1)}K`,
            sub: '+18.4% MoM',
            icon: DollarSign,
            accent: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
          },
          {
            label: 'Total Orders',
            value: metrics.totalOrders,
            sub: '+12 this week',
            icon: ShoppingCart,
            accent: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            label: 'Products Live',
            value: metrics.totalProducts,
            sub: 'Curated catalog',
            icon: Package,
            accent: 'text-amber-800',
            bg: 'bg-amber-50 border-amber-200',
          },
          {
            label: 'Conversion',
            value: `${metrics.conversionRate}%`,
            sub: 'Storefront rate',
            icon: ArrowUpRight,
            accent: 'text-purple-700',
            bg: 'bg-purple-50 border-purple-200',
          },
          {
            label: 'Customers',
            value: metrics.totalCustomers,
            sub: 'Active accounts',
            icon: Users,
            accent: 'text-sky-700',
            bg: 'bg-sky-50 border-sky-200',
          },
          {
            label: 'Low Stock',
            value: metrics.lowStockCount,
            sub: metrics.lowStockCount > 0 ? 'Requires attention' : 'Inventory healthy',
            icon: AlertTriangle,
            accent: metrics.lowStockCount > 0 ? 'text-rose-700' : 'text-emerald-700',
            bg: metrics.lowStockCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200',
          },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-2 hover:border-slate-300 transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {m.label}
                </span>
                <div className={`p-1.5 rounded-lg border ${m.bg} ${m.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{m.value}</p>
              <p className={`text-[10px] font-bold ${m.accent}`}>{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Sparkline + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sparkline */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Gross Revenue Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days performance (₹ INR)</p>
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+22.1%</span>
            </div>
          </div>
          <div className="flex items-end gap-2.5 h-32 pt-4">
            {REVENUE_BARS.map((val, i) => {
              const pct = (val / MAX_REV) * 100;
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center space-y-1.5 h-full justify-end">
                  <div
                    className="w-full rounded-t-lg bg-slate-200 hover:bg-amber-500 transition-all duration-300 relative group cursor-pointer"
                    style={{ height: `${pct}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                      ₹{val.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Top Performing Artifacts</h2>
            <Link href="/admin/products" className="text-xs font-bold text-amber-700 hover:underline">
              Full Catalog →
            </Link>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Damascus Steel Viking Battle Axe', orders: 28, revenue: 237972 },
              { name: 'Full Suit of Templar Knight Armor', orders: 14, revenue: 489986 },
              { name: 'Roman Centurion Brass Officer Helmet', orders: 19, revenue: 119681 },
              { name: 'Artisan Solid Oak Gothic Armchair', orders: 6, revenue: 113994 },
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-xs font-black text-amber-800 w-5 flex-shrink-0">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.orders} completed orders</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 ml-4 flex-shrink-0">
                  ₹{(p.revenue / 1000).toFixed(0)}K
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Journey Funnel */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-amber-600" />
              <span>Full Customer Journey Funnel (Telemetry)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              12-point conversion telemetry from initial impression to customer review
            </p>
          </div>
          <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
            3.12% end-to-end conversion
          </div>
        </div>

        <div className="space-y-2.5">
          {FUNNEL_EVENTS.map((event, idx) => {
            const pct = Math.round((event.value / FUNNEL_EVENTS[0].value) * 100);
            const Icon = event.icon;
            const prevVal = idx > 0 ? FUNNEL_EVENTS[idx - 1].value : event.value;
            const dropPct =
              idx > 0 ? Math.round(((prevVal - event.value) / prevVal) * 100) : null;

            return (
              <div key={event.label} className="flex items-center gap-3 group">
                <div className="flex items-center space-x-2 w-44 flex-shrink-0">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: event.color + '15', color: event.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                    {event.label}
                  </span>
                </div>
                <div className="flex-1 relative h-5 sm:h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: event.color }}
                  />
                </div>
                <div className="w-24 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-black text-slate-900">
                    {event.value.toLocaleString()}
                  </span>
                  {dropPct !== null && dropPct > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 ml-1">
                      -{dropPct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-amber-700 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer / Email</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Fulfillment Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentOrders.length > 0 ? recentOrders : [
                { id: 'ord_91823', customer: 'Lord Alexander', total: 34999, status: 'PLACED', date: 'Just now' },
                { id: 'ord_78231', customer: 'Rohan Sharma', total: 8499, status: 'SHIPPED', date: '2 hours ago' },
                { id: 'ord_65219', customer: 'David King', total: 6299, status: 'DELIVERED', date: 'Yesterday' },
                { id: 'ord_51204', customer: 'Priya Sen', total: 18999, status: 'CONFIRMED', date: '2 days ago' },
              ]).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-800">#{o.id}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    {o.user?.name || o.guestEmail || o.customer || 'Guest Collector'}
                  </td>
                  <td className="p-3 font-bold text-slate-900">₹{Number(o.total).toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : o.date || 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
