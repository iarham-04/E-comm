'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Star, Tag } from 'lucide-react';

// Demo data — replace with API fetch in production
const DEMO_CATEGORIES = [
  { id: 'cat-1', name: 'Medieval',    slug: 'medieval',    isFeaturedCollection: false },
  { id: 'cat-2', name: 'Viking',      slug: 'viking',      isFeaturedCollection: false },
  { id: 'cat-3', name: 'Roman',       slug: 'roman',       isFeaturedCollection: false },
  { id: 'cat-4', name: 'Gifts',       slug: 'gifts',       isFeaturedCollection: true  },
  { id: 'cat-5', name: 'New Arrivals',slug: 'new-arrivals', isFeaturedCollection: true  },
  { id: 'cat-6', name: 'Furniture',   slug: 'furniture',   isFeaturedCollection: false },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', isFeaturedCollection: false });
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ name: '', slug: '', isFeaturedCollection: false }); setEditingId(null); setShowForm(false); };

  const handleEdit = (cat: typeof DEMO_CATEGORIES[0]) => {
    setForm({ name: cat.name, slug: cat.slug, isFeaturedCollection: cat.isFeaturedCollection });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/admin/categories/${editingId}` : '/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(`http://localhost:4000${url}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        const saved = await res.json();
        if (editingId) {
          setCategories((prev) => prev.map((c) => (c.id === editingId ? saved : c)));
        } else {
          setCategories((prev) => [...prev, saved]);
        }
        resetForm();
      }
    } catch {
      // Demo mode — apply locally
      if (editingId) {
        setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form } : c));
      } else {
        setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, ...form }]);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleFeatured = async (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFeaturedCollection: !c.isFeaturedCollection } : c))
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">← Admin Dashboard</Link>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-1">Category Management</h1>
          <p className="text-xs text-slate-500 mt-1">{categories.length} categories · {categories.filter((c) => c.isFeaturedCollection).length} featured on homepage</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="self-start sm:self-auto flex items-center space-x-1.5 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">{editingId ? 'Edit Category' : 'Create Category'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Medieval"
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. medieval"
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
            </div>
          </div>
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeaturedCollection}
              onChange={(e) => setForm({ ...form, isFeaturedCollection: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800">Featured Collection</span>
              <p className="text-[11px] text-slate-500">Displayed in the homepage Gifts / New Arrivals section</p>
            </div>
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
              className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
            </button>
            <button onClick={resetForm} className="text-xs font-semibold text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Featured on Homepage</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cat.name}</span>
                </td>
                <td className="px-5 py-4 font-mono text-slate-500">{cat.slug}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleFeatured(cat.id)}
                    className={`flex items-center space-x-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                      cat.isFeaturedCollection ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${cat.isFeaturedCollection ? 'fill-amber-500' : ''}`} />
                    <span>{cat.isFeaturedCollection ? 'Featured' : 'Not Featured'}</span>
                  </button>
                </td>
                <td className="px-5 py-4 text-right flex items-center justify-end gap-3">
                  <button onClick={() => handleEdit(cat)} className="text-slate-500 hover:text-slate-900 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
