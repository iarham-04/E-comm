'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductGridCard from '@/components/ProductGridCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search, X, ChevronDown, ChevronUp, SlidersHorizontal,
  Package, Loader2, Sparkles, Shield, Armchair, Sword,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const PAGE_SIZE = 24;

const MATERIALS = ['Steel', 'Brass', 'Bronze', 'Iron', 'Teak Wood', 'Oak', 'Leather', 'Copper', 'Silver', 'Ceramic'];

const POPULAR_CATEGORIES = [
  { name: 'Medieval Armor', slug: 'medieval', icon: Shield },
  { name: 'Viking Weaponry', slug: 'viking', icon: Sword },
  { name: 'Home Décor', slug: 'home-decor', icon: Armchair },
];

/* ─── Skeleton card for loading state ─────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="aspect-square bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
        <div className="h-6 bg-slate-100 rounded-lg w-1/3" />
      </div>
    </div>
  );
}

/* ─── Collapsible filter section ──────────────────────────────────────────── */
function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Active filter chip ──────────────────────────────────────────────────── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
      <span>{label}</span>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-700 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

/* ─── Main search page content (uses useSearchParams) ─────────────────────── */
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  // Filter state
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [limitedOnly, setLimitedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(query ? 'relevance' : 'newest');

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Mobile filter drawer
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!query && !category && !material && !minPrice && !maxPrice && !limitedOnly) {
        // No query or filters — show the "no query" empty state
        setProducts([]);
        setTotal(0);
        setInitialLoad(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        if (category) params.set('category', category);
        if (material) params.set('material', material);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (limitedOnly) params.set('isLimitedEdition', 'true');
        if (sort && sort !== 'relevance') params.set('sort', sort);
        params.set('page', String(pageNum));
        params.set('limit', String(PAGE_SIZE));

        const res = await fetch(`${API_URL}/products?${params.toString()}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        let results = data.data || [];

        // Client-side in-stock filter (the API doesn't have this param — we filter locally)
        if (inStockOnly) {
          results = results.filter((p: any) => (p.stock ?? 0) > 0);
        }

        if (append) {
          setProducts((prev) => [...prev, ...results]);
        } else {
          setProducts(results);
        }

        setTotal(data.total || 0);
        setPage(pageNum);
      } catch {
        if (!append) setProducts([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [query, category, material, minPrice, maxPrice, limitedOnly, inStockOnly, sort],
  );

  // Re-fetch when filters change (reset to page 1)
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const handleLoadMore = () => {
    fetchProducts(page + 1, true);
  };

  const clearFilters = () => {
    setCategory('');
    setMaterial('');
    setMinPrice('');
    setMaxPrice('');
    setLimitedOnly(false);
    setInStockOnly(false);
    setSort(query ? 'relevance' : 'newest');
  };

  const hasFilters = category || material || minPrice || maxPrice || limitedOnly || inStockOnly;
  const hasMorePages = products.length < total;
  const noQuery = !query && !hasFilters;

  // Determine which empty state to show
  const showNoQueryState = noQuery && !loading && !initialLoad;
  const showZeroResultsForQuery = !noQuery && products.length === 0 && !loading && !initialLoad && query && !hasFilters;
  const showZeroResultsForFilters = !noQuery && products.length === 0 && !loading && !initialLoad && hasFilters;

  /* ─── Filter sidebar content (shared desktop/mobile) ──────────────────── */
  const filterContent = (
    <div className="space-y-0">
      {/* Category */}
      <FilterSection title="Category" defaultOpen>
        <div className="space-y-1.5">
          <button
            onClick={() => setCategory('')}
            className={`block w-full text-left text-xs px-3 py-2 rounded-xl transition-colors ${
              !category ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`block w-full text-left text-xs px-3 py-2 rounded-xl transition-colors ${
                category === cat.slug ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material">
        <div className="space-y-1.5">
          {MATERIALS.map((mat) => (
            <button
              key={mat}
              onClick={() => setMaterial(material === mat ? '' : mat)}
              className={`block w-full text-left text-xs px-3 py-2 rounded-xl transition-colors ${
                material === mat ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Limited Edition */}
      <FilterSection title="Edition">
        <label className="flex items-center space-x-2.5 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={limitedOnly}
            onChange={(e) => setLimitedOnly(e.target.checked)}
            className="w-4 h-4 accent-slate-900 rounded"
          />
          <span className="text-xs font-semibold text-slate-700">Limited Edition Only</span>
        </label>
      </FilterSection>

      {/* In Stock */}
      <FilterSection title="Availability">
        <label className="flex items-center space-x-2.5 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-slate-900 rounded"
          />
          <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 pb-6 mb-8">
        {query ? (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Search Results</p>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Showing results for &ldquo;{query}&rdquo;
            </h1>
            {!initialLoad && (
              <p className="text-xs text-slate-500 mt-1.5">
                {total} {total === 1 ? 'result' : 'results'} found
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Discover</p>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Search the Collection
            </h1>
          </>
        )}
      </div>

      {/* ── No Query State ─────────────────────────────────────────────────── */}
      {showNoQueryState && (
        <div className="max-w-lg mx-auto text-center space-y-8 py-12">
          <div className="inline-flex p-5 rounded-full bg-slate-50 border border-slate-200">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">What are you looking for?</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Search for museum-grade armor, hand-forged weapons, artisan home décor, and collector pieces — or browse a curated collection below.
            </p>
          </div>

          {/* Popular category shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto pt-4">
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="group/cat flex flex-col items-center space-y-2 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-150"
                >
                  <div className="p-3 rounded-xl bg-slate-50 group-hover/cat:bg-slate-100 transition-colors">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Content (sidebar + grid) ──────────────────────────────────── */}
      {!showNoQueryState && (
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Filters</span>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Mobile filter toggle + Sort */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasFilters && (
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-3 ml-auto">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-xs font-bold border border-slate-200 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
                >
                  {query && <option value="relevance">Relevance</option>}
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {category && (
                  <FilterChip
                    label={`Category: ${categories.find((c) => c.slug === category)?.name || category}`}
                    onRemove={() => setCategory('')}
                  />
                )}
                {material && <FilterChip label={`Material: ${material}`} onRemove={() => setMaterial('')} />}
                {(minPrice || maxPrice) && (
                  <FilterChip
                    label={`Price: ${minPrice ? `₹${minPrice}` : '₹0'} – ${maxPrice ? `₹${maxPrice}` : '∞'}`}
                    onRemove={() => { setMinPrice(''); setMaxPrice(''); }}
                  />
                )}
                {limitedOnly && <FilterChip label="Limited Edition" onRemove={() => setLimitedOnly(false)} />}
                {inStockOnly && <FilterChip label="In Stock Only" onRemove={() => setInStockOnly(false)} />}
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Initial loading — skeleton grid */}
            {initialLoad && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Zero results for query (no filters active) */}
            {showZeroResultsForQuery && (
              <EmptyState
                icon={<Search className="w-8 h-8 text-slate-300" />}
                title={`No products match "${query}"`}
                description="Try different search terms, check your spelling, or browse our full collection."
                actionLabel="Browse the Collection"
                actionHref="/products"
              />
            )}

            {/* Zero results from filters */}
            {showZeroResultsForFilters && (
              <EmptyState
                icon={<Package className="w-8 h-8 text-slate-300" />}
                title="No results match your filters"
                description="We curate a tight selection — try broadening your filters or clearing them."
                actionLabel="Clear filters"
                onAction={clearFilters}
              />
            )}

            {/* Product grid */}
            {products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((p: any) => (
                    <ProductGridCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      category={p.category?.name || ''}
                      price={Number(p.price)}
                      rating={p.averageRating ?? undefined}
                      reviewsCount={p._count?.reviews ?? p.reviewsCount ?? 0}
                      image={p.images?.[0] || ''}
                      images={p.images}
                      stock={p.stock}
                      material={p.material}
                      isLimitedEdition={p.isLimitedEdition}
                      editionNumber={p.editionNumber}
                      editionTotal={p.editionTotal}
                    />
                  ))}

                  {/* Skeleton cards while loading more */}
                  {loading && page > 1 && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
                </div>

                {/* Load More */}
                {hasMorePages && !loading && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      className="flex items-center space-x-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Load More Pieces</span>
                    </button>
                  </div>
                )}

                {/* Loading indicator for Load More */}
                {loading && page > 1 && (
                  <div className="flex justify-center mt-8">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Filter Bottom Sheet ─────────────────────────────────────── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-250">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">Filters</span>
              <div className="flex items-center space-x-4">
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[11px] font-bold text-slate-400">
                    Clear all
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Scrollable filters */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {filterContent}
            </div>
            {/* Apply button */}
            <div className="px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Show {total} {total === 1 ? 'Result' : 'Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page wrapper with Suspense boundary for useSearchParams ─────────────── */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-32" />
            <div className="h-10 bg-slate-100 rounded-xl w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
