'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, Plus, Save, AlertTriangle, Search, Eye, EyeOff,
  TrendingUp, Trash2, Edit3, ExternalLink, Loader2, Sparkles, RefreshCw
} from 'lucide-react';
import { API_URL } from '@/lib/api';

interface ProductItem {
  id: string;
  name: string;
  category?: { name: string } | string;
  price: number | string;
  stock: number;
  isActive: boolean;
  status?: string;
  slug: string;
  images?: string[];
  ordersCount?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          return;
        }
      }

      // Fallback to public products endpoint
      const fallbackRes = await fetch(`${API_URL}/products`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const list = Array.isArray(fallbackData) ? fallbackData : fallbackData.items || [];
        setProducts(list);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = [
    'All',
    ...Array.from(
      new Set(
        products.map((p) =>
          typeof p.category === 'object' ? p.category?.name || 'General' : p.category || 'General'
        )
      )
    ),
  ];

  const lowStockCount = products.filter((p) => p.stock <= 3 && p.isActive).length;

  const filtered = products.filter((p) => {
    const categoryName =
      typeof p.category === 'object' ? p.category?.name || '' : p.category || '';
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || categoryName === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleStockChange = (id: string, val: number) => {
    setEditingStock((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (id: string) => {
    const newStock = editingStock[id];
    if (newStock === undefined) return;

    setActionLoading(id);
    try {
      await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
      );
      const copy = { ...editingStock };
      delete copy[id];
      setEditingStock(copy);
    } catch {
      // fallback
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    setActionLoading(id);
    try {
      await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
      );
    } catch {
      // local toggle fallback
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setActionLoading(id);
    try {
      await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // fallback
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors"
          >
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Product &amp; Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {products.length} live database products{' '}
            {lowStockCount > 0 && (
              <span className="text-amber-800 font-bold ml-2 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block">
                · {lowStockCount} low stock alerts
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition"
            title="Refresh Products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/10 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} critically low in stock (&le;3 units).
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (INR)</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Loading store catalog...</span>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const currentStock =
                    editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock;
                  const isLow = currentStock <= 3;
                  const isOutOfStock = currentStock === 0;
                  const catName =
                    typeof p.category === 'object'
                      ? p.category?.name || 'General'
                      : p.category || 'General';
                  const coverImage = p.images?.[0];

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !p.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {coverImage ? (
                              <img
                                src={coverImage}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="line-clamp-1 max-w-56 text-slate-900">{p.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                          {catName}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min={0}
                            value={currentStock}
                            onChange={(e) =>
                              handleStockChange(p.id, parseInt(e.target.value) || 0)
                            }
                            className={`w-16 p-1.5 border rounded-lg text-xs font-bold text-center focus:outline-none bg-white text-slate-900 ${
                              isOutOfStock
                                ? 'border-rose-300 bg-rose-50 text-rose-800'
                                : isLow
                                ? 'border-amber-300 bg-amber-50 text-amber-900'
                                : 'border-slate-200'
                            }`}
                          />
                          {editingStock[p.id] !== undefined && (
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              disabled={actionLoading === p.id}
                              className="p-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition"
                              title="Save Stock"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleActive(p.id, p.isActive)}
                          disabled={actionLoading === p.id}
                          className={`flex items-center space-x-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-colors ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {p.isActive ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          <span>{p.isActive ? 'Active' : 'Draft'}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-800 transition inline-block"
                          title="Preview in Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-amber-700 transition inline-block"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={actionLoading === p.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition inline-block"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-600" />
            <p className="font-semibold">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
