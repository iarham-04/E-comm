'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Save, AlertTriangle, Search, Eye, EyeOff, TrendingUp } from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 'p-1', name: 'Full Suit of Templar Knight Armor', category: 'Medieval', price: 34999.00, stock: 5, active: true, orders: 14, slug: 'templar-knight-armor' },
  { id: 'p-2', name: 'Hand-Carved Nordic Viking Battle Axe', category: 'Viking', price: 8499.00, stock: 12, active: true, orders: 28, slug: 'viking-battle-axe' },
  { id: 'p-3', name: 'Roman Centurion Brass Officer Helmet', category: 'Roman', price: 6299.00, stock: 2, active: true, orders: 9, slug: 'roman-officer-helmet' },
  { id: 'p-4', name: 'Artisan Solid Oak Gothic Armchair', category: 'Furniture', price: 18999.00, stock: 3, active: true, orders: 6, slug: 'gothic-oak-armchair' },
  { id: 'p-5', name: 'Gothic Iron Candelabra Set', category: 'Home Décor', price: 3499.00, stock: 15, active: true, orders: 41, slug: 'gothic-iron-candelabra' },
  { id: 'p-6', name: 'Hand-Forged Damascene Steel Dagger', category: 'Collectibles', price: 7299.00, stock: 1, active: false, orders: 5, slug: 'damascene-steel-dagger' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Medieval: 'bg-slate-100 text-slate-700',
  Viking: 'bg-blue-50 text-blue-700',
  Roman: 'bg-amber-50 text-amber-800',
  Furniture: 'bg-stone-100 text-stone-700',
  'Home Décor': 'bg-rose-50 text-rose-700',
  Collectibles: 'bg-purple-50 text-purple-700',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.category)))];
  const lowStockCount = products.filter((p) => p.stock <= 3 && p.active).length;

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleStockChange = (id: string, val: number) => {
    setEditingStock((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = (id: string) => {
    const newStock = editingStock[id];
    if (newStock !== undefined) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
      const copy = { ...editingStock };
      delete copy[id];
      setEditingStock(copy);
    }
  };

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-1">
            Product &amp; Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">{products.length} curated products · {lowStockCount > 0 && <span className="text-amber-600 font-bold">{lowStockCount} low stock alerts</span>}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="self-start sm:self-auto bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-800 font-semibold">
            {lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} critically low in stock (≤3 units). Review and restock below.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                categoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Total Orders</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const currentStock = editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock;
                const isLow = currentStock <= 3;
                const isOutOfStock = currentStock === 0;

                return (
                  <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${!p.active ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        {isLow && !isOutOfStock && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        {isOutOfStock && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                        <span className="line-clamp-1 max-w-52">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[p.category] || 'bg-slate-100 text-slate-600'}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          value={currentStock}
                          onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                          className={`w-16 p-1.5 border rounded-lg text-xs font-bold text-center focus:outline-none ${
                            isOutOfStock
                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                              : isLow
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : 'border-slate-200 bg-white'
                          }`}
                        />
                        {editingStock[p.id] !== undefined && (
                          <button
                            onClick={() => handleSaveStock(p.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            title="Save Stock"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold">{p.orders}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(p.id)}
                        className={`flex items-center space-x-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-colors ${
                          p.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{p.active ? 'Active' : 'Archived'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                    <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs font-semibold text-amber-700 hover:underline mr-2"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/products/${p.slug}`}
                        className="text-xs font-semibold text-slate-500 hover:underline"
                        target="_blank"
                      >
                        Preview ↗
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold">No products match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
