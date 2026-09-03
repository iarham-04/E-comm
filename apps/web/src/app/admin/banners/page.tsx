'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface BannerItem {
  id: string;
  imageUrl: string;
  headline?: string;
  subtext?: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    imageUrl: '',
    headline: '',
    subtext: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/admin/banners');
      if (res.ok) setBanners(await res.json());
    } catch {
      setMessage({ type: 'error', text: 'Failed to load banners.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('http://localhost:4000/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Homepage banner created.' });
        setShowModal(false);
        setForm({ imageUrl: '', headline: '', subtext: '', linkUrl: '', sortOrder: 0, isActive: true });
        fetchBanners();
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`http://localhost:4000/admin/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Banner deleted.' });
        fetchBanners();
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
            Homepage Banners Management
          </h1>
          <p className="text-xs text-slate-400">Curate promotional hero banners, campaign graphics, and feature announcements.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
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

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
              <img src={b.imageUrl} alt={b.headline || ''} className="w-full h-full object-cover" />
              <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                {b.isActive ? 'ACTIVE' : 'HIDDEN'}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-bold text-white text-sm">{b.headline || 'Untitled Banner'}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{b.subtext || 'No subtext'}</p>
              {b.linkUrl && (
                <p className="text-[11px] font-mono text-amber-400 truncate">Links to: {b.linkUrl}</p>
              )}
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Order: #{b.sortOrder}</span>
              <button onClick={() => handleDelete(b.id)} className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs text-slate-100">
            <h2 className="font-bold text-base text-white">Add Homepage Banner</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL *</label>
                <input
                  required
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Masterwork Toledo Steel Armor"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtext</label>
                <input
                  type="text"
                  placeholder="e.g. Hand-forged limited edition collection"
                  value={form.subtext}
                  onChange={(e) => setForm({ ...form, subtext: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Link URL</label>
                <input
                  type="text"
                  placeholder="/collections/medieval"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                />
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
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
