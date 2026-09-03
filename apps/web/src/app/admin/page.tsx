'use client';

import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp,
  ArrowUpRight, BarChart2, Users, Eye, Search, Heart, CreditCard,
  CheckCircle2, Truck, MessageSquare, Star,
} from 'lucide-react';

const METRICS = {
  totalRevenue: 184500.00,
  totalOrders: 42,
  totalProducts: 24,
  conversionRate: 3.12,
  lowStockCount: 2,
  totalCustomers: 318,
};

const RECENT_ORDERS = [
  { id: 'CT-12345', customer: 'Alexander V.', total: 34999.00, status: 'PLACED', date: 'Just now' },
  { id: 'CT-9821', customer: 'Rohan M.', total: 8499.00, status: 'SHIPPED', date: '2 hours ago' },
  { id: 'CT-8412', customer: 'David K.', total: 6299.00, status: 'DELIVERED', date: 'Yesterday' },
  { id: 'CT-7203', customer: 'Priya S.', total: 18999.00, status: 'CONFIRMED', date: '2 days ago' },
];

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

// Funnel — 12 customer journey telemetry events
const FUNNEL_EVENTS = [
  { label: 'Homepage Views',    icon: Eye,          value: 8240,  color: '#6366f1' },
  { label: 'Search Queries',    icon: Search,       value: 3980,  color: '#8b5cf6' },
  { label: 'Product Views',     icon: Package,      value: 2641,  color: '#a855f7' },
  { label: 'Image Zooms',       icon: Eye,          value: 1820,  color: '#c084fc' },
  { label: 'Wishlist Adds',     icon: Heart,        value: 1310,  color: '#ec4899' },
  { label: 'Add to Cart',       icon: ShoppingCart, value: 894,   color: '#f43f5e' },
  { label: 'Checkout Start',    icon: CreditCard,   value: 568,   color: '#f97316' },
  { label: 'Payment Success',   icon: CheckCircle2, value: 257,   color: '#eab308' },
  { label: 'Shipped Orders',    icon: Truck,        value: 214,   color: '#22c55e' },
  { label: 'Delivered',         icon: CheckCircle2, value: 189,   color: '#10b981' },
  { label: 'Reviews Written',   icon: Star,         value: 68,    color: '#14b8a6' },
  { label: 'Newsletter Signups',icon: MessageSquare,value: 441,   color: '#06b6d4' },
];

// Revenue sparkline mock data (last 7 days)
const REVENUE_BARS = [12400, 18200, 9800, 24100, 31200, 16800, 28400];
const MAX_REV = Math.max(...REVENUE_BARS);

// Top products
const TOP_PRODUCTS = [
  { name: 'Gothic Iron Candelabra Set', orders: 41, revenue: 143459.00 },
  { name: 'Viking Battle Axe', orders: 28, revenue: 237972.00 },
  { name: 'Templar Knight Armor', orders: 14, revenue: 489986.00 },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Corazonetouch Admin</span>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-1">Executive Command Centre</h1>
          <p className="text-xs text-slate-500 mt-1">Live analytics · Customer journey · Inventory alerts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="bg-white border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(METRICS.totalRevenue / 1000).toFixed(0)}K`, sub: '+18.4% MoM', icon: DollarSign, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Orders', value: METRICS.totalOrders, sub: '+12 this week', icon: ShoppingCart, accent: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Products Live', value: METRICS.totalProducts, sub: 'Curated catalog', icon: Package, accent: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Conversion', value: `${METRICS.conversionRate}%`, sub: 'View → Purchase', icon: ArrowUpRight, accent: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Customers', value: METRICS.totalCustomers, sub: 'Registered collectors', icon: Users, accent: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Low Stock', value: METRICS.lowStockCount, sub: 'Need restock', icon: AlertTriangle, accent: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</span>
                <div className={`p-1.5 ${m.bg} ${m.accent} rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{m.value}</p>
              <p className={`text-[10px] font-semibold ${m.accent}`}>{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Sparkline + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Sparkline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue — Last 7 Days</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily gross revenue (INR)</p>
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+22.1%</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-28">
            {REVENUE_BARS.map((val, i) => {
              const pct = (val / MAX_REV) * 100;
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                  <div
                    className="w-full rounded-t-md bg-slate-900 transition-all duration-500 hover:bg-amber-500"
                    style={{ height: `${pct}%` }}
                    title={`₹${val.toLocaleString('en-IN')}`}
                  />
                  <span className="text-[9px] text-slate-400 font-semibold">{days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Top Performing Products</h2>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-xs font-black text-slate-300 w-4 flex-shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.orders} orders</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 ml-4 flex-shrink-0">₹{(p.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Journey Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Customer Journey Funnel</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">12-event telemetry · Homepage → Review · Last 30 days</p>
          </div>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            3.12% end-to-end conversion
          </div>
        </div>

        <div className="space-y-2.5">
          {FUNNEL_EVENTS.map((event, idx) => {
            const pct = Math.round((event.value / FUNNEL_EVENTS[0].value) * 100);
            const Icon = event.icon;
            const prevVal = idx > 0 ? FUNNEL_EVENTS[idx - 1].value : event.value;
            const dropPct = idx > 0 ? Math.round(((prevVal - event.value) / prevVal) * 100) : null;

            return (
              <div key={event.label} className="flex items-center gap-3 group">
                <div className="flex items-center space-x-2 w-44 flex-shrink-0">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: event.color + '20', color: event.color }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">{event.label}</span>
                </div>
                <div className="flex-1 relative h-6 bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: event.color }}
                  />
                </div>
                <div className="w-24 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-black text-slate-900">{event.value.toLocaleString()}</span>
                  {dropPct !== null && dropPct > 0 && (
                    <span className="text-[10px] font-bold text-rose-500 ml-1">-{dropPct}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
          Funnel drop-off percentages show session-to-session attrition rates compared to the previous step.
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-amber-700 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">#{o.id}</td>
                  <td className="p-3 font-semibold text-slate-800">{o.customer}</td>
                  <td className="p-3 font-bold text-slate-900">₹{o.total.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
