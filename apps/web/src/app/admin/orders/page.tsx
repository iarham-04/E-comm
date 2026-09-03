'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, Package, CheckCircle2, Truck, Star, XCircle, RefreshCw, Printer, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface OrderItemData {
  id: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  carrier?: string;
  trackingNumber?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  user?: { name?: string; email?: string };
  guestEmail?: string;
  addressSnapshot?: any;
  items: { product: { name: string }; quantity: number; priceAtPurchase: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PLACED:    { label: 'Placed',    color: 'bg-amber-100 text-amber-800',   icon: Package },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800',     icon: CheckCircle2 },
  SHIPPED:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: Star },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800',     icon: XCircle },
};

const STATUS_FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState<OrderItemData | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Tracking Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState<OrderItemData | null>(null);
  const [carrier, setCarrier] = useState('Shiprocket / Bluedart');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Order #${id.slice(-6).toUpperCase()} status updated to ${newStatus}.` });
        fetchOrders();
      }
    } catch {
      setMessage({ type: 'error', text: 'Status update failed.' });
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;
    setRefunding(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/admin/orders/${refundModalOrder.id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount: Number(refundAmount),
          refundReason,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Order #${refundModalOrder.id.slice(-6).toUpperCase()} refunded successfully.` });
        setRefundModalOrder(null);
        setRefundAmount('');
        setRefundReason('');
        fetchOrders();
      } else {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Refund failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setRefunding(false);
    }
  };

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    setSavingTracking(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/admin/orders/${trackingModalOrder.id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, carrier }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Tracking info saved for Order #${trackingModalOrder.id.slice(-6).toUpperCase()}.` });
        setTrackingModalOrder(null);
        setTrackingNumber('');
        fetchOrders();
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSavingTracking(false);
    }
  };

  const handlePrintInvoice = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/invoice`);
      if (res.ok) {
        const inv = await res.json();
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`
            <html>
              <head>
                <title>Invoice ${inv.invoiceNumber}</title>
                <style>
                  body { font-family: sans-serif; padding: 40px; color: #0f172a; }
                  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; pb: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                  th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
                  th { background: #f8fafc; font-size: 12px; }
                  .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div>
                    <h2>CORAZONETOUCH INVOICE</h2>
                    <p>Invoice #: <strong>${inv.invoiceNumber}</strong></p>
                    <p>Order Date: ${new Date(inv.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Billed To:</strong></p>
                    <p>${inv.customerName}</p>
                    <p>${inv.customerEmail}</p>
                  </div>
                </div>
                <table>
                  <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    ${inv.items.map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.unitPrice}</td><td>₹${i.total}</td></tr>`).join('')}
                  </tbody>
                </table>
                <div class="total">Subtotal: ₹${inv.subtotal} | Shipping: ₹${inv.shippingFee} | Total Paid: ₹${inv.total}</div>
                <script>window.print();</script>
              </body>
            </html>
          `);
          win.document.close();
        }
      }
    } catch {
      alert('Invoice generation failed.');
    }
  };

  const filtered = orders.filter((o) => {
    const cust = o.user?.name || o.user?.email || o.guestEmail || '';
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      cust.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 text-xs text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
            Order Lifecycle &amp; Fulfillment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage statuses, issue Razorpay refunds, set carrier tracking numbers, and print invoices.
          </p>
        </div>

        <button onClick={fetchOrders} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'}`}>
          {message.text}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('All')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${statusFilter === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            All Orders ({orders.length})
          </button>
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${statusFilter === s ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ref or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Ref</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Status &amp; Flow</th>
              <th className="py-3.5 px-4">Tracking</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-white">#{o.id.slice(-6).toUpperCase()}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-white">{o.user?.name || o.guestEmail || 'Collector'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{o.user?.email || o.guestEmail || '—'}</p>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-amber-400">₹{Number(o.total).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentStatus === 'REFUNDED' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                    {o.paymentMethod} · {o.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-[11px]"
                  >
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-[11px]">
                  {o.trackingNumber ? (
                    <span className="text-purple-400 font-mono">{o.carrier}: {o.trackingNumber}</span>
                  ) : (
                    <button onClick={() => { setTrackingModalOrder(o); setTrackingNumber(o.trackingNumber || ''); }} className="text-amber-400 font-bold hover:underline">
                      + Add Tracking
                    </button>
                  )}
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => handlePrintInvoice(o.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="Print PDF Invoice"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  {o.paymentStatus !== 'REFUNDED' && (
                    <button
                      onClick={() => { setRefundModalOrder(o); setRefundAmount(String(o.total)); }}
                      className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg"
                      title="Issue Refund"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <h2 className="font-bold text-base text-white">Issue Order Refund (Order #{refundModalOrder.id.slice(-6).toUpperCase()})</h2>
            <form onSubmit={handleRefundSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Refund Amount (₹) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  max={Number(refundModalOrder.total)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Refund Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Customer returned item in original condition"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setRefundModalOrder(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" disabled={refunding} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl">
                  {refunding ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <h2 className="font-bold text-base text-white">Add Shipping Tracking Info</h2>
            <form onSubmit={handleTrackingSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Carrier Name *</label>
                <input
                  required
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tracking / Waybill Number *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AWB987654321"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setTrackingModalOrder(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" disabled={savingTracking} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Save Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
