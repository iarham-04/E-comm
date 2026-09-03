'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader2, AlertTriangle, Copy, ChevronDown, ChevronUp, Globe } from 'lucide-react';

const COMMON_MATERIALS = ['Brass', 'Bronze', 'Iron', 'Steel', 'Teak Wood', 'Oak', 'Ceramic', 'Terracotta', 'Stone', 'Leather', 'Velvet', 'Glass', 'Silver', 'Gold', 'Copper'];

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: Partial<ProductFormData>;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  isActive: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  metaTitle: string;
  metaDescription: string;
  craftsmanshipStory: string;
  material: string;
  heightCm: string;
  widthCm: string;
  depthCm: string;
  weightKg: string;
  isLimitedEdition: boolean;
  editionNumber: string;
  editionTotal: string;
  isGiftEligible: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '', slug: '', description: '', price: '', categoryId: '',
  stock: '0', isActive: true, status: 'DRAFT',
  metaTitle: '', metaDescription: '',
  craftsmanshipStory: '', material: '',
  heightCm: '', widthCm: '', depthCm: '', weightKg: '',
  isLimitedEdition: false, editionNumber: '', editionTotal: '',
  isGiftEligible: true,
};

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM, ...initialData });
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof ProductFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleDuplicate = async () => {
    if (!productId) return;
    setDuplicating(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4000/admin/products/${productId}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to duplicate product');
      const copy = await res.json();
      router.push(`/admin/products/${copy.id}/edit`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDuplicating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.isLimitedEdition) {
      if (!form.editionNumber || !form.editionTotal) {
        setError('Both Edition Number and Edition Total are required for limited edition products.');
        return;
      }
      if (Number(form.editionNumber) > Number(form.editionTotal)) {
        setError(`Edition Number (${form.editionNumber}) must be ≤ Edition Total (${form.editionTotal}).`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        stock: Number(form.stock),
        isActive: form.isActive,
        status: form.status,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        isGiftEligible: form.isGiftEligible,
        isLimitedEdition: form.isLimitedEdition,
      };

      if (form.craftsmanshipStory) payload.craftsmanshipStory = form.craftsmanshipStory;
      if (form.material) payload.material = form.material;
      if (form.heightCm) payload.heightCm = Number(form.heightCm);
      if (form.widthCm)  payload.widthCm  = Number(form.widthCm);
      if (form.depthCm)  payload.depthCm  = Number(form.depthCm);
      if (form.weightKg) payload.weightKg = Number(form.weightKg);
      if (form.isLimitedEdition) {
        payload.editionNumber = Number(form.editionNumber);
        payload.editionTotal  = Number(form.editionTotal);
      }

      const url = mode === 'create' ? '/admin/products' : `/admin/products/${productId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(`http://localhost:4000${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Server error ${res.status}`);
      }

      router.push('/admin/products');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white';
  const labelCls = 'block text-xs font-bold text-slate-700 mb-1';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/products" className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← Back to Products
          </Link>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-1">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
        </div>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={duplicating}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-colors disabled:opacity-50"
          >
            {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            <span>{duplicating ? 'Duplicating...' : 'Duplicate Product'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start space-x-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 mb-6 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Core Info ──────────────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Core Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input required value={form.name} onChange={(e) => { set('name', e.target.value); if (!form.slug) set('slug', autoSlug(e.target.value)); }} className={inputCls} placeholder="e.g. Templar Knight Armor" />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input required value={form.slug} onChange={(e) => set('slug', e.target.value)} className={`${inputCls} font-mono`} placeholder="auto-generated" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} placeholder="Main product description visible to all visitors" />
            </div>
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} placeholder="34999.00" />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Category ID *</label>
              <input required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputCls} placeholder="category cuid from /admin/categories" />
            </div>
            <div>
              <label className={labelCls}>Publication Status (Gatekeeper)</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value as any)} className={`${inputCls} font-bold`}>
                <option value="DRAFT">DRAFT (Hidden from Storefront)</option>
                <option value="PUBLISHED">PUBLISHED (Live on Storefront)</option>
              </select>
            </div>
            <div className="flex items-center space-x-6 pt-4 sm:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-slate-900" />
                <span className="text-xs font-bold text-slate-800">Active (Visible when Published)</span>
              </label>
            </div>
          </div>
        </section>

        {/* ── Collapsible SEO Section ─────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">SEO Meta Tags (Search Engine Optimization)</h2>
            </div>
            {seoOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {seoOpen && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div>
                <label className={labelCls}>Meta Title (Google Snippet Title)</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => set('metaTitle', e.target.value)}
                  className={inputCls}
                  placeholder="Defaults to product name if blank"
                />
              </div>
              <div>
                <label className={labelCls}>Meta Description (Google Search Snippet)</label>
                <textarea
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => set('metaDescription', e.target.value)}
                  className={inputCls}
                  placeholder="Defaults to truncated product description if blank"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Craftsmanship & Origin (Collector Persona) ─────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Craftsmanship &amp; Origin</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">For collectors — shown as a distinct section on the product page.</p>
          </div>
          <textarea
            rows={4}
            value={form.craftsmanshipStory}
            onChange={(e) => set('craftsmanshipStory', e.target.value)}
            className={inputCls}
            placeholder="Describe the materials, origin country, production technique, historical significance..."
          />
        </section>

        {/* ── Dimensions & Materials (Designer Persona) ──────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Dimensions &amp; Materials</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">For interior designers — presented as a clean spec table.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Material</label>
              <input
                list="material-options"
                value={form.material}
                onChange={(e) => set('material', e.target.value)}
                className={inputCls}
                placeholder="e.g. Brass, Teak Wood"
              />
              <datalist id="material-options">
                {COMMON_MATERIALS.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div />
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input type="number" min="0" step="0.01" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} className={inputCls} placeholder="—" />
            </div>
            <div>
              <label className={labelCls}>Width (cm)</label>
              <input type="number" min="0" step="0.01" value={form.widthCm} onChange={(e) => set('widthCm', e.target.value)} className={inputCls} placeholder="—" />
            </div>
            <div>
              <label className={labelCls}>Depth (cm)</label>
              <input type="number" min="0" step="0.01" value={form.depthCm} onChange={(e) => set('depthCm', e.target.value)} className={inputCls} placeholder="—" />
            </div>
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" min="0" step="0.01" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} className={inputCls} placeholder="—" />
            </div>
          </div>
        </section>

        {/* ── Limited Edition ────────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Edition &amp; Gifting</h2>
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input type="checkbox" checked={form.isLimitedEdition} onChange={(e) => set('isLimitedEdition', e.target.checked)} className="w-4 h-4 accent-slate-900 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-800">Limited Edition</span>
              <p className="text-[11px] text-slate-500">Displays a "127 of 500" badge on the product page.</p>
            </div>
          </label>

          {form.isLimitedEdition && (
            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-amber-200">
              <div>
                <label className={labelCls}>This Item's Number *</label>
                <input required type="number" min="1" value={form.editionNumber} onChange={(e) => set('editionNumber', e.target.value)} className={inputCls} placeholder="e.g. 127" />
              </div>
              <div>
                <label className={labelCls}>Total Edition Size *</label>
                <input required type="number" min="1" value={form.editionTotal} onChange={(e) => set('editionTotal', e.target.value)} className={inputCls} placeholder="e.g. 500" />
              </div>
            </div>
          )}

          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input type="checkbox" checked={form.isGiftEligible} onChange={(e) => set('isGiftEligible', e.target.checked)} className="w-4 h-4 accent-slate-900 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-800">Gift Eligible</span>
              <p className="text-[11px] text-slate-500">Shows "Eligible for gift wrapping at checkout" on the product page.</p>
            </div>
          </label>
        </section>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}</span>
          </button>
          <Link href="/admin/products" className="text-xs font-semibold text-slate-600 border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
