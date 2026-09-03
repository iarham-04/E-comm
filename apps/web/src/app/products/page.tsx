'use client';

import { useState, useCallback } from 'react';
import ProductGridCard from '@/components/ProductGridCard';
import { Search, Package, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

const DEMO_PRODUCTS = [
  { id: 'p-1', name: 'Full Suit of Templar Knight Armor', slug: 'templar-knight-armor', category: 'Medieval', price: 34999.00, rating: 4.9, reviewsCount: 84, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=800', stock: 5, material: 'Steel', isLimitedEdition: true },
  { id: 'p-2', name: 'Hand-Carved Nordic Viking Battle Axe', slug: 'viking-battle-axe', category: 'Viking', price: 8499.00, rating: 4.8, reviewsCount: 112, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800', stock: 12, material: 'Steel', isLimitedEdition: false },
  { id: 'p-3', name: 'Roman Centurion Brass Officer Helmet', slug: 'roman-officer-helmet', category: 'Roman', price: 6299.00, rating: 4.7, reviewsCount: 46, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800', stock: 8, material: 'Brass', isLimitedEdition: false },
  { id: 'p-4', name: 'Artisan Solid Oak Gothic Armchair', slug: 'gothic-oak-armchair', category: 'Furniture', price: 18999.00, rating: 5.0, reviewsCount: 29, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800', stock: 3, material: 'Oak', isLimitedEdition: false },
  { id: 'p-5', name: 'Gothic Iron Candelabra Set', slug: 'gothic-iron-candelabra', category: 'Home Décor', price: 3499.00, rating: 4.9, reviewsCount: 63, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800', stock: 15, material: 'Iron', isLimitedEdition: false },
  { id: 'p-6', name: 'Hand-Forged Damascene Steel Dagger', slug: 'damascene-steel-dagger', category: 'Collectibles', price: 7299.00, rating: 4.9, reviewsCount: 31, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800', stock: 6, material: 'Damascene Steel', isLimitedEdition: true },
];

const CATEGORIES = ['All', 'Medieval', 'Viking', 'Roman', 'Home Décor', 'Collectibles', 'Furniture'];
const MATERIALS  = ['All', 'Steel', 'Brass', 'Iron', 'Oak', 'Damascene Steel'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'relevance',  label: 'Most Relevant' },
];

export default function ProductsPage({ searchParams }: { searchParams?: { search?: string } }) {
  const [search,      setSearch]      = useState(searchParams?.search ?? '');
  const [category,    setCategory]    = useState('All');
  const [material,    setMaterial]    = useState('All');
  const [limitedOnly, setLimitedOnly] = useState(false);
  const [sort,        setSort]        = useState('newest');

  const clearFilters = () => { setSearch(''); setCategory('All'); setMaterial('All'); setLimitedOnly(false); setSort('newest'); };
  const hasFilters = search || category !== 'All' || material !== 'All' || limitedOnly;

  const filtered = DEMO_PRODUCTS.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'All' && p.category !== category) return false;
    if (material !== 'All' && p.material !== material) return false;
    if (limitedOnly && !p.isLimitedEdition) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'price_asc')  return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* Page Header */}
      <div className="border-b border-slate-100 pb-8 space-y-2">
        <Badge variant="gold" size="sm">Curated Collection · {DEMO_PRODUCTS.length} Museum-Grade Pieces</Badge>
        <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">
          {search ? `Results for "${search}"` : 'The Collection'}
        </h1>
        <p className="text-xs text-slate-500">Every piece earns its place. Showing {filtered.length} items.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="search"
          placeholder="Search by name, category, or material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-y-4 gap-x-6 items-start">

        {/* Category pills */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${category === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Material pills */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material</p>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((mat) => (
              <button key={mat} onClick={() => setMaterial(mat)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${material === mat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* Limited Edition toggle + Sort */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edition</p>
            <button
              onClick={() => setLimitedOnly((v) => !v)}
              className={`flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${limitedOnly ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <span>Limited Edition Only</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-bold border border-slate-200 bg-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors pb-2">
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid / Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-slate-300" />}
          title="No pieces match your filters"
          description="We curate a tight selection — try broadening your search or resetting filters."
          actionLabel="Clear all filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((product) => (
            <ProductGridCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
