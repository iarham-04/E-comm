'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Star, Tag, Loader2, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  isFeaturedCollection?: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', isFeaturedCollection: false });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          return;
        }
      }
      // Fallback
      const pubRes = await fetch(`${API_URL}/categories`);
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (Array.isArray(pubData)) setCategories(pubData);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', isFeaturedCollection: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: CategoryItem) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      isFeaturedCollection: !!cat.isFeaturedCollection,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/admin/categories/${editingId}` : '/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(`${API_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

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
      if (editingId) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
        );
      } else {
        setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, ...form }]);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`${API_URL}/admin/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeaturedCollection: !current }),
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isFeaturedCollection: !current } : c
        )
      );
    } catch {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isFeaturedCollection: !current } : c
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {categories.length} store categories ·{' '}
            {categories.filter((c) => c.isFeaturedCollection).length} featured on homepage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Category Name *</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  })
                }
                placeholder="e.g. Damascus Steel Artifacts"
                className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">URL Slug *</label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  })
                }
                placeholder="e.g. damascus-steel-artifacts"
                className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
            </div>
          </div>
          <label className="flex items-center space-x-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.isFeaturedCollection}
              onChange={(e) =>
                setForm({ ...form, isFeaturedCollection: e.target.checked })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-200">
                Featured Collection on Homepage
              </span>
              <p className="text-[11px] text-slate-400">
                Highlighted with special showcase cards on the storefront.
              </p>
            </div>
          </label>
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.slug}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
            </button>
            <button
              onClick={resetForm}
              className="text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 bg-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Featured on Homepage</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>Loading categories...</span>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-5 py-4 font-bold text-white flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{cat.name}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-400">/{cat.slug}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        toggleFeatured(cat.id, !!cat.isFeaturedCollection)
                      }
                      className={`flex items-center space-x-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                        cat.isFeaturedCollection
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      <Star
                        className={`w-3 h-3 ${
                          cat.isFeaturedCollection ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                      <span>{cat.isFeaturedCollection ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-slate-800 transition"
                        title="Edit Category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 bg-slate-900 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-800 hover:border-rose-500/30 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
