'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface ProductInventory {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
  category: { name: string };
  variants: { id: string; size?: string; color?: string; stock: number }[];
}

export default function BulkInventoryPage() {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const map: Record<string, number> = {};
        data.forEach((p: ProductInventory) => {
          map[p.id] = p.stock;
          p.variants?.forEach((v) => {
            map[`var-${v.id}`] = v.stock;
          });
        });
        setStockMap(map);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load product inventory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (key: string, value: string) => {
    const num = parseInt(value, 10);
    setStockMap((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : Math.max(0, num) }));
  };

  const handleBulkSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const items: Array<{ productId: string; variantId?: string; stock: number }> = [];

      products.forEach((p) => {
        if (stockMap[p.id] !== undefined && stockMap[p.id] !== p.stock) {
          items.push({ productId: p.id, stock: stockMap[p.id] });
        }
        p.variants?.forEach((v) => {
          if (stockMap[`var-${v.id}`] !== undefined && stockMap[`var-${v.id}`] !== v.stock) {
            items.push({ productId: p.id, variantId: v.id, stock: stockMap[`var-${v.id}`] });
          }
        });
      });

      if (items.length === 0) {
        setMessage({ type: 'success', text: 'No stock changes detected.' });
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/products/bulk-stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully updated stock for ${items.length} inventory items.` });
        fetchProducts();
      } else {
        throw new Error('Bulk inventory update failed.');
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
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
            Bulk Inventory Management
          </h1>
          <p className="text-xs text-slate-400">Edit stock counts across all catalog products simultaneously.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleBulkSave}
            disabled={saving || loading}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <Link href={`/admin/products/${p.id}/edit`} className="hover:text-amber-400">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{p.category?.name || '—'}</td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      min="0"
                      value={stockMap[p.id] ?? p.stock}
                      onChange={(e) => handleStockChange(p.id, e.target.value)}
                      className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-right font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
