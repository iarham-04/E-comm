'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, Percent, Filter, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function AnalyticsReportsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [salesByProduct, setSalesByProduct] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [aovReport, setAovReport] = useState<any>(null);
  const [couponReport, setCouponReport] = useState<any[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    const qs = params.toString() ? `?${params.toString()}` : '';

    try {
      const [resRev, resProd, resCat, resAov, resCpn] = await Promise.all([
        fetch(`${API_URL}/admin/reports/revenue${qs}`),
        fetch(`${API_URL}/admin/reports/sales-by-product${qs}`),
        fetch(`${API_URL}/admin/reports/top-categories${qs}`),
        fetch(`${API_URL}/admin/reports/average-order-value${qs}`),
        fetch(`${API_URL}/admin/reports/coupon-performance${qs}`),
      ]);

      if (resRev.ok) setRevenueReport(await resRev.json());
      if (resProd.ok) setSalesByProduct(await resProd.json());
      if (resCat.ok) setTopCategories(await resCat.json());
      if (resAov.ok) setAovReport(await resAov.json());
      if (resCpn.ok) setCouponReport(await resCpn.json());
    } catch {
      // Graceful error state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6 text-xs text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight mt-1">
            Analytics &amp; Financial Reports
          </h1>
          <p className="text-xs text-neutral-400">Deep-dive financial telemetry, sales velocity by product, top category distribution, and coupon ROI.</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-neutral-200">
          <Calendar className="w-4 h-4 text-neutral-600" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2 py-1 bg-[#fafafa] border border-neutral-200 rounded-lg text-neutral-900 font-mono text-xs"
          />
          <span className="text-neutral-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2 py-1 bg-[#fafafa] border border-neutral-200 rounded-lg text-neutral-900 font-mono text-xs"
          />
          <button
            onClick={fetchReports}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold transition-colors"
            title="Filter Date Range"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-display text-2xl font-bold text-neutral-900">
            ₹{revenueReport?.totalRevenue ? Number(revenueReport.totalRevenue).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[10px] text-neutral-500">{revenueReport?.orderCount || 0} paid orders</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Average Order Value (AOV)</span>
            <TrendingUp className="w-4 h-4 text-neutral-600" />
          </div>
          <p className="font-display text-2xl font-bold text-neutral-600">
            ₹{aovReport?.aov ? Number(aovReport.aov).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[10px] text-neutral-500">Per completed customer transaction</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Coupon Performance</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="font-display text-2xl font-bold text-neutral-900">
            {couponReport.length} Active Sales
          </p>
          <p className="text-[10px] text-neutral-500">Tracking code &amp; automatic collection sales</p>
        </div>
      </div>

      {/* 2-Column Detail Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Product */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-neutral-900 border-b border-neutral-200 pb-2">Sales Velocity by Product</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-200">
                <tr>
                  <th className="py-2">Product Name</th>
                  <th className="py-2 text-right">Units Sold</th>
                  <th className="py-2 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {salesByProduct.slice(0, 5).map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-bold text-neutral-900">{p.name}</td>
                    <td className="py-2.5 text-right font-mono text-neutral-400">{p.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-neutral-600 font-bold">₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-neutral-900 border-b border-neutral-200 pb-2">Top Performing Categories</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-200">
                <tr>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Units Sold</th>
                  <th className="py-2 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {topCategories.slice(0, 5).map((c, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-bold text-neutral-900">{c.categoryName}</td>
                    <td className="py-2.5 text-right font-mono text-neutral-400">{c.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-700 font-bold">₹{c.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coupon Performance Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-sm text-neutral-900 border-b border-neutral-200 pb-2">Coupon &amp; Campaign Performance Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-200">
              <tr>
                <th className="py-2">Promotion Target / Code</th>
                <th className="py-2 text-right">Total Uses</th>
                <th className="py-2 text-right">Matched Orders</th>
                <th className="py-2 text-right">Total Discount Given</th>
                <th className="py-2 text-right">Generated Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {couponReport.map((cpn, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 font-bold text-neutral-600 font-mono">{cpn.code}</td>
                  <td className="py-2.5 text-right font-mono text-neutral-400">{cpn.usesCount}</td>
                  <td className="py-2.5 text-right font-mono text-neutral-400">{cpn.orderMatchesCount}</td>
                  <td className="py-2.5 text-right font-mono text-rose-600">₹{cpn.totalDiscountGiven.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right font-mono text-emerald-700 font-bold">₹{cpn.totalRevenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
