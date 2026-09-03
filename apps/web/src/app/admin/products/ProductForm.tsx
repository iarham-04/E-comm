'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save, Loader2, AlertTriangle, Copy, ChevronDown, ChevronUp, Globe,
  Upload, X, Image as ImageIcon, CheckCircle2, Sparkles
} from 'lucide-react';
import { API_URL } from '@/lib/api';

const COMMON_MATERIALS = [
  'Brass', 'Bronze', 'Iron', 'Steel', 'Teak Wood', 'Oak', 'Ceramic',
  'Terracotta', 'Stone', 'Leather', 'Velvet', 'Glass', 'Silver', 'Gold', 'Copper'
];

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
  images: string[];
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
  stock: '10', images: [], isActive: true, status: 'PUBLISHED',
  metaTitle: '', metaDescription: '',
  craftsmanshipStory: '', material: '',
  heightCm: '', widthCm: '', depthCm: '', weightKg: '',
  isLimitedEdition: false, editionNumber: '', editionTotal: '',
  isGiftEligible: true,
};

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM, ...initialData });
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories for dropdown
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          if (!form.categoryId && data[0]?.id) {
            set('categoryId', data[0].id);
          }
        } else {
          // Fallback categories
          setCategories([
            { id: 'cat-medieval', name: 'Medieval Armor & Weapons' },
            { id: 'cat-viking', name: 'Viking Artifacts' },
            { id: 'cat-roman', name: 'Roman Collectibles' },
            { id: 'cat-decor', name: 'Artisanal Home Décor' },
          ]);
        }
      })
      .catch(() => {
        setCategories([
          { id: 'cat-medieval', name: 'Medieval Armor & Weapons' },
          { id: 'cat-viking', name: 'Viking Artifacts' },
          { id: 'cat-roman', name: 'Roman Collectibles' },
        ]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const set = (field: keyof ProductFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Handle Image Upload to S3
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/uploads`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Image upload failed.');
        }

        const data = await res.json();
        if (data?.url) {
          uploadedUrls.push(data.url);
        }
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err: any) {
      setError(`Image Upload Error: ${err.message}`);
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleDuplicate = async () => {
    if (!productId) return;
    setDuplicating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/products/${productId}/duplicate`, {
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
        images: form.images,
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

      const res = await fetch(`${API_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Server error ${res.status}`);
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 text-xs border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-slate-900 text-white placeholder-slate-500';
  const labelCls = 'block text-xs font-bold text-slate-300 mb-1';

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/products" className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors">
            ← Back to Products
          </Link>
          <h1 className="font-display text-3xl font-black text-white tracking-tight mt-1">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
        </div>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={duplicating}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
          >
            {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            <span>{duplicating ? 'Duplicating...' : 'Duplicate Product'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start space-x-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-5 py-4 mb-6 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Core Info ──────────────────────────────────────────────── */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Core Product Details</span>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">Required</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!form.slug || mode === 'create') set('slug', autoSlug(e.target.value));
                }}
                className={inputCls}
                placeholder="e.g. Damascus Steel Viking Battle Axe"
              />
            </div>
            <div>
              <label className={labelCls}>URL Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                className={`${inputCls} font-mono`}
                placeholder="damascus-steel-viking-battle-axe"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className={inputCls}
                placeholder="Detailed description of the product for customers and search engines..."
              />
            </div>
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={inputCls}
                placeholder="14999.00"
              />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity *</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                className={inputCls}
                placeholder="10"
              />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              {loadingCategories ? (
                <div className="text-xs text-slate-500 py-2.5">Loading categories...</div>
              ) : (
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  className={inputCls}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className={labelCls}>Publication Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as any)}
                className={`${inputCls} font-bold text-amber-400`}
              >
                <option value="PUBLISHED">PUBLISHED (Live on Storefront)</option>
                <option value="DRAFT">DRAFT (Hidden / Preview Only)</option>
              </select>
            </div>
            <div className="flex items-center space-x-6 pt-2 sm:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs font-bold text-slate-200">Active (Visible in catalog)</span>
              </label>
            </div>
          </div>
        </section>

        {/* ── AWS S3 Image Upload Section ─────────────────────────────── */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Product Images (AWS S3 Cloud Storage)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload high-res product photos. The first image serves as the primary storefront image.
              </p>
            </div>
            {uploadingImage && (
              <span className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading to S3...</span>
              </span>
            )}
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-200">
              Click to upload photos to AWS S3
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports PNG, JPG, WebP up to 10MB per image
            </p>
          </label>

          {/* Image Previews Grid */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {form.images.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square"
                >
                  <img
                    src={url}
                    alt={`Product Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                      COVER
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Craftsmanship & Origin ─────────────────────────────────── */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Craftsmanship &amp; Historical Origin</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tells the blacksmithing, forging, or historical story displayed on the product page.
            </p>
          </div>
          <textarea
            rows={4}
            value={form.craftsmanshipStory}
            onChange={(e) => set('craftsmanshipStory', e.target.value)}
            className={inputCls}
            placeholder="Hand-forged using 1095 high-carbon steel folded 512 times..."
          />
        </section>

        {/* ── Dimensions & Materials ─────────────────────────────────── */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Dimensions &amp; Materials Spec Sheet</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Primary Material</label>
              <input
                list="material-options"
                value={form.material}
                onChange={(e) => set('material', e.target.value)}
                className={inputCls}
                placeholder="e.g. Hand-Hammered Brass"
              />
              <datalist id="material-options">
                {COMMON_MATERIALS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weightKg}
                onChange={(e) => set('weightKg', e.target.value)}
                className={inputCls}
                placeholder="2.4"
              />
            </div>
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.heightCm}
                onChange={(e) => set('heightCm', e.target.value)}
                className={inputCls}
                placeholder="45"
              />
            </div>
            <div>
              <label className={labelCls}>Width (cm)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.widthCm}
                onChange={(e) => set('widthCm', e.target.value)}
                className={inputCls}
                placeholder="30"
              />
            </div>
          </div>
        </section>

        {/* ── Limited Edition & Gifting ───────────────────────────────── */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Limited Edition &amp; Gifting Options
          </h2>
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isLimitedEdition}
              onChange={(e) => set('isLimitedEdition', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded mt-0.5"
            />
            <div>
              <span className="text-xs font-bold text-slate-200">Limited Edition Batch</span>
              <p className="text-[11px] text-slate-400">
                Displays a "127 of 500" numbered badge on the storefront.
              </p>
            </div>
          </label>

          {form.isLimitedEdition && (
            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-amber-500/40">
              <div>
                <label className={labelCls}>Edition Number *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.editionNumber}
                  onChange={(e) => set('editionNumber', e.target.value)}
                  className={inputCls}
                  placeholder="127"
                />
              </div>
              <div>
                <label className={labelCls}>Total Edition Batch Size *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.editionTotal}
                  onChange={(e) => set('editionTotal', e.target.value)}
                  className={inputCls}
                  placeholder="500"
                />
              </div>
            </div>
          )}

          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isGiftEligible}
              onChange={(e) => set('isGiftEligible', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded mt-0.5"
            />
            <div>
              <span className="text-xs font-bold text-slate-200">Gift Wrapping Eligible</span>
              <p className="text-[11px] text-slate-400">
                Allows customers to add complimentary wax-sealed gift packaging.
              </p>
            </div>
          </label>
        </section>

        {/* ── SEO Section ────────────────────────────────────────────── */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">
                SEO &amp; Google Search Meta Tags
              </h2>
            </div>
            {seoOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {seoOpen && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div>
                <label className={labelCls}>Google Snippet Title</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => set('metaTitle', e.target.value)}
                  className={inputCls}
                  placeholder="Defaults to product name if blank"
                />
              </div>
              <div>
                <label className={labelCls}>Google Search Description</label>
                <textarea
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => set('metaDescription', e.target.value)}
                  className={inputCls}
                  placeholder="Defaults to product description if blank"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Submit Buttons ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saving
                ? 'Saving to Database...'
                : mode === 'create'
                ? 'Publish Product'
                : 'Save Changes'}
            </span>
          </button>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 bg-slate-900 px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
