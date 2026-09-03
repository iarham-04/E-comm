'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Tag, Percent, Calendar, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface CollectionOption {
  id: string;
  name: string;
}

interface CouponItem {
  id: string;
  code?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue?: number;
  startsAt?: string;
  expiresAt?: string;
  appliesToCollectionId?: string;
  appliesToCollection?: { name: string };
  isActive: boolean;
}

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    isCollectionSale: false,
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: '',
    minOrderValue: '',
    appliesToCollectionId: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCoupons, resCats] = await Promise.all([
        fetch('http://localhost:4000/admin/coupons'),
        fetch('http://localhost:4000/categories'),
      ]);
      if (resCoupons.ok) setCoupons(await resCoupons.json());
      if (resCats.ok) setCollections(await resCats.json());
    } catch {
      setMessage({ type: 'error', text: 'Failed to load coupons & sales.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const payload: any = {
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        isActive: form.isActive,
      };

      if (!form.isCollectionSale) {
        if (!form.code.trim()) {
          setMessage({ type: 'error', text: 'Coupon code is required.' });
          return;
        }
        payload.code = form.code.trim().toUpperCase();
        if (form.minOrderValue) payload.minOrderValue = Number(form.minOrderValue);
      } else {
        if (!form.appliesToCollectionId) {
          setMessage({ type: 'error', text: 'Collection selection is required for automatic sale.' });
          return;
        }
        payload.appliesToCollectionId = form.appliesToCollectionId;
      }

      if (form.startsAt) payload.startsAt = new Date(form.startsAt).toISOString();
      if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

      const res = await fetch('http://localhost:4000/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Discount promotion created successfully.' });
        setShowModal(false);
        setForm({
          isCollectionSale: false, code: '', discountType: 'PERCENTAGE', discountValue: '',
          minOrderValue: '', appliesToCollectionId: '', startsAt: '', expiresAt: '', isActive: true,
        });
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Creation failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const res = await fetch(`http://localhost:4000/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Promotion deleted.' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Delete failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
            Discounts &amp; Collection Sales Manager
          </h1>
          <p className="text-xs text-slate-400">Configure code-based coupons or automatic collection-wide sale events.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount / Sale</span>
        </button>
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

      {/* Promotions Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Promotion Type</th>
              <th className="py-3.5 px-4">Code / Collection Target</th>
              <th className="py-3.5 px-4">Discount Value</th>
              <th className="py-3.5 px-4">Validity Window</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 font-medium">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4 font-bold text-white">
                  {c.appliesToCollectionId ? (
                    <span className="flex items-center space-x-1.5 text-indigo-400">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Automatic Collection Sale</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-amber-400">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code Coupon</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-white">
                  {c.code || c.appliesToCollection?.name || `Collection #${c.appliesToCollectionId}`}
                </td>
                <td className="py-3 px-4 font-bold text-amber-400">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </td>
                <td className="py-3 px-4 text-slate-400 text-[11px]">
                  {c.startsAt ? new Date(c.startsAt).toLocaleDateString() : 'Immediate'} → {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs text-slate-100">
            <h2 className="font-bold text-base text-white">Create New Promotion</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Promotion Mode</label>
                <select
                  value={form.isCollectionSale ? 'collection' : 'code'}
                  onChange={(e) => setForm({ ...form, isCollectionSale: e.target.value === 'collection' })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="code">Code-Based Coupon (Entered at checkout)</option>
                  <option value="collection">Automatic Collection Sale (No code needed)</option>
                </select>
              </div>

              {!form.isCollectionSale ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Coupon Code *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1999"
                      value={form.minOrderValue}
                      onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Collection *</label>
                  <select
                    required
                    value={form.appliesToCollectionId}
                    onChange={(e) => setForm({ ...form, appliesToCollectionId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="">Select Collection Target...</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Value *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Starts At</label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <label className="font-bold text-slate-300">Active Immediately</label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400"
                >
                  Create Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
