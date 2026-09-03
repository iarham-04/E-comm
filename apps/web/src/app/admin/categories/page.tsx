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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-5 gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-bold text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1">
            Category Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {categories.length} store categories ·{' '}
            {categories.filter((c) => c.isFeaturedCollection).length} featured on homepage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 bg-[#fafafa] hover:bg-neutral-100 text-neutral-400 rounded-xl border border-neutral-200 transition"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-neutral-300/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-200 pb-3">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400">Category Name *</label>
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
                className="w-full px-3 py-2.5 text-xs bg-[#fafafa] border border-neutral-200 rounded-xl text-neutral-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400">URL Slug *</label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  })
                }
                placeholder="e.g. damascus-steel-artifacts"
                className="w-full px-3 py-2.5 text-xs bg-[#fafafa] border border-neutral-200 rounded-xl text-neutral-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
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
              <span className="text-xs font-bold text-neutral-700">
                Featured Collection on Homepage
              </span>
              <p className="text-[11px] text-neutral-400">
                Highlighted with special showcase cards on the storefront.
              </p>
            </div>
          </label>
          <div className="flex gap-2 pt-2 border-t border-neutral-200">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.slug}
              className="bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
            </button>
            <button
              onClick={resetForm}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 border border-neutral-200 bg-[#fafafa] px-4 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#fafafa] border-b border-neutral-200 text-neutral-400 uppercase font-bold tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Featured on Homepage</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-neutral-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-600" />
                  <span>Loading categories...</span>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#fafafa]/60 transition-colors">
                  <td className="px-5 py-4 font-bold text-neutral-900 flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{cat.name}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-neutral-400">/{cat.slug}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        toggleFeatured(cat.id, !!cat.isFeaturedCollection)
                      }
                      className={`flex items-center space-x-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                        cat.isFeaturedCollection
                          ? 'bg-neutral-900/10 text-amber-300 border border-neutral-300'
                          : 'bg-[#fafafa] text-neutral-500 border border-neutral-200'
                      }`}
                    >
                      <Star
                        className={`w-3 h-3 ${
                          cat.isFeaturedCollection ? 'fill-amber-400 text-neutral-600' : ''
                        }`}
                      />
                      <span>{cat.isFeaturedCollection ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 bg-[#fafafa] hover:bg-neutral-100 text-neutral-600 rounded-lg border border-neutral-200 transition"
                        title="Edit Category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 bg-[#fafafa] hover:bg-rose-50 text-rose-600 rounded-lg border border-neutral-200 hover:border-rose-200 transition"
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
