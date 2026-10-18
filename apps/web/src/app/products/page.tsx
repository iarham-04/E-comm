'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductGridCard from '@/components/ProductGridCard';
import { Search, Package, X, Loader2, SlidersHorizontal, LayoutGrid, List, Check } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { API_URL } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Relevance' },
  { value: 'newest',     label: 'Newest Arrivals' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating_desc',label: 'Highest Rated' },
];

export default function ProductsPage({ searchParams }: { searchParams?: { search?: string } }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.search ?? '');
  const [category, setCategory] = useState('All');
  const [material, setMaterial] = useState('All');
  const [limitedOnly, setLimitedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.items;
        if (Array.isArray(items) && items.length > 0) {
          setProducts(
            items.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              category: typeof p.category === 'object' ? p.category?.name || 'General' : p.category || 'General',
              price: Number(p.price) || 0,
              rating: p.rating || 4.9,
              reviewsCount: p.reviewsCount || 0,
              image: p.images?.[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800',
              images: p.images || [],
              stock: p.stock ?? 10,
              material: p.material || 'Artisanal Forged',
              isLimitedEdition: !!p.isLimitedEdition,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const c = typeof p.category === 'object' ? p.category?.name : p.category;
      if (c) set.add(c);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.material && p.material !== 'Artisanal Forged') set.add(p.material);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMaterial('All');
    setLimitedOnly(false);
    setInStockOnly(false);
    setSort('relevance');
  };

  const activeFiltersCount = [
    category !== 'All',
    material !== 'All',
    limitedOnly,
    inStockOnly,
    Boolean(search),
  ].filter(Boolean).length;

  const filtered = products
    .filter((p) => {
      const catName = typeof p.category === 'object' ? p.category?.name || '' : p.category || '';
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !catName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (category !== 'All' && catName !== category) return false;
      if (material !== 'All' && p.material !== material) return false;
      if (limitedOnly && !p.isLimitedEdition) return false;
      if (inStockOnly && p.stock === 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* Search & Quick Bar (Optional clean search) */}
        {search && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h1 className="font-display text-2xl sm:text-3xl text-slate-900">
              Results for &ldquo;{search}&rdquo;
            </h1>
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1"
            >
              <span>Clear search</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── YIOSI REFERENCE TOOLBAR ─── */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 select-none">
          {/* Left: Show filter toggle */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-900 hover:text-amber-800 transition-colors group py-1"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-700 group-hover:text-amber-800 transition-colors" />
            <span>Show filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Right: Results Count + View Switcher + Sort by dropdown */}
          <div className="flex items-center space-x-2.5 sm:space-x-8 text-xs sm:text-sm text-slate-600">
            {/* Results count */}
            <span className="text-slate-500 font-normal text-[11px] sm:text-sm">
              {filtered.length} results
            </span>

            {/* View Mode Switcher */}
            <div className="flex items-center space-x-0.5 border-l border-r border-slate-200 px-1.5 sm:px-3">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 sm:p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 sm:p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Sort by dropdown */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 hidden md:inline">Sort by:</span>
              <div className="relative inline-block">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-slate-900 font-medium text-[11px] sm:text-sm pr-3 sm:pr-6 py-1 focus:outline-none cursor-pointer border-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ACTIVE FILTER CHIPS (IF ANY) ─── */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium mr-1">Active:</span>
            {category !== 'All' && (
              <span className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">
                <span>{category}</span>
                <button onClick={() => setCategory('All')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {material !== 'All' && (
              <span className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">
                <span>{material}</span>
                <button onClick={() => setMaterial('All')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {limitedOnly && (
              <span className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">
                <span>Limited Editions</span>
                <button onClick={() => setLimitedOnly(false)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">
                <span>In Stock Only</span>
                <button onClick={() => setInStockOnly(false)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-900 underline ml-2"
            >
              Reset all
            </button>
          </div>
        )}

        {/* ─── PRODUCT LISTING (GRID OR LIST) ─── */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-amber-500" />
            <span className="tracking-wide">Loading catalog...</span>
          </div>
        ) : filtered.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-8 sm:gap-x-6 sm:gap-y-12">
              {filtered.map((product) => (
                <ProductGridCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  category={
                    typeof product.category === 'object'
                      ? product.category?.name || 'General'
                      : product.category || 'General'
                  }
                  price={product.price}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  image={product.image}
                  images={product.images}
                  stock={product.stock}
                  material={product.material}
                  isLimitedEdition={product.isLimitedEdition}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <ProductGridCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  category={
                    typeof product.category === 'object'
                      ? product.category?.name || 'General'
                      : product.category || 'General'
                  }
                  price={product.price}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  image={product.image}
                  images={product.images}
                  stock={product.stock}
                  material={product.material}
                  isLimitedEdition={product.isLimitedEdition}
                  viewMode="list"
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No pieces found"
            description="Try changing your filters or searching for another term."
            actionLabel="View All Pieces"
            onAction={clearFilters}
          />
        )}
      </div>

      {/* ─── LEFT SLIDE-IN FILTER DRAWER ─── */}
      <Drawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filter"
        side="left"
        size="md"
      >
        <div className="space-y-8 pb-12">
          {/* Search within filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Collections / Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Collections
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    category === cat
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat === 'All' ? 'All Collections' : cat}</span>
                  {category === cat && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Materials */}
          {materials.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Material
              </h4>
              <div className="space-y-1">
                {materials.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setMaterial(mat)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      material === mat
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{mat === 'All' ? 'All Materials' : mat}</span>
                    {material === mat && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rarity & Availability */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Availability &amp; Editions
            </h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <span className="text-xs text-slate-800">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <span className="text-xs text-slate-800">Numbered Limited Editions</span>
                <input
                  type="checkbox"
                  checked={limitedOnly}
                  onChange={(e) => setLimitedOnly(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                />
              </label>
            </div>
          </div>

          {/* Bottom Drawer Actions */}
          <div className="pt-6 border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="w-1/3 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
