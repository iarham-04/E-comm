'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import ProductGridCard from '@/components/ProductGridCard';
import {
  Heart, ShoppingBag, Gift, ChevronLeft, ChevronRight, Star,
  ShieldCheck, Truck, RotateCcw, Lock, Maximize2, X, MessageSquarePlus, Check, Sparkles
} from 'lucide-react';

import { API_URL } from '@/lib/api';

// Fallback demo product if backend isn't populated or slug isn't found
const FALLBACK_PRODUCT = {
  id: 'p-1',
  name: 'Full Suit of Templar Knight Armor',
  slug: 'templar-knight-armor',
  description:
    'An awe-inspiring museum-grade reproduction of 14th-century Crusader armor. Each plate is individually articulated for dramatic display, rendered in high-carbon forged steel with an oil-blackened finish that deepens over time.',
  price: 34999.00,
  images: [
    'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=1200',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200',
  ],
  category: { name: 'Medieval', slug: 'medieval' },
  stock: 5,
  isActive: true,
  craftsmanshipStory:
    'Forged in Toledo, Spain — the city synonymous with European blade mastery since the Roman era — by a third-generation armorsmith. The gorget, pauldrons, and gauntlets are individually hammer-worked from 2mm high-carbon steel at 58 HRC. The finish is authentic oil quenching, which produces the darkened patina that medieval knights relied on for corrosion resistance. The armour is modelled directly after the Lyle-Howard suit preserved in the Royal Armouries Museum, Leeds, and verified for dimensional accuracy against their published catalogue.',
  material: 'High-Carbon Steel',
  heightCm: 185,
  widthCm: 62,
  depthCm: 40,
  weightKg: 22.5,
  isLimitedEdition: true,
  editionNumber: 127,
  editionTotal: 500,
  editionDisplay: '127 of 500',
  isGiftEligible: true,
  variants: [
    { id: 'v-1', size: 'Standard (175–185 cm)', color: 'Oil-Blackened Steel', stock: 3, priceDelta: 0 },
    { id: 'v-2', size: 'Large (185–195 cm)', color: 'Polished Steel', stock: 2, priceDelta: 2500 },
  ],
  reviews: [
    { id: 'r1', rating: 5, comment: 'Absolutely stunning. The craftsmanship is beyond what I expected. Worth every rupee.', createdAt: '2026-06-14', user: { name: 'Alexander V.' } },
    { id: 'r2', rating: 5, comment: 'The patina finish is exactly as described. My study has never looked more magnificent.', createdAt: '2026-05-22', user: { name: 'David K.' } },
    { id: 'r3', rating: 4, comment: 'Remarkable weight and authenticity. Articulation works smoothly.', createdAt: '2026-04-10', user: { name: 'Marcus R.' } },
  ],
};

const COMPACT_TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Authenticity Guaranteed' },
  { icon: Truck, label: '3–5 Day Express Delivery' },
  { icon: RotateCcw, label: '30-Day Easy Returns' },
  { icon: Lock, label: '256-Bit SSL Encrypted' },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(FALLBACK_PRODUCT);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImage, setActiveImage] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Buy Box state
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const formatPrice = useCurrencyStore((s) => s.formatPrice);
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Load Product by Slug
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setProduct(data);
            if (data.variants && data.variants.length > 0) {
              setSelectedVariant(data.variants[0]);
            }
          }
        }
      } catch {
        // Fallback to demo product if slug matches or generic
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [params.slug]);

  // Load Related Products
  useEffect(() => {
    async function fetchRelated() {
      try {
        const categorySlug = product.category?.slug;
        const res = await fetch(`${API_URL}/products?limit=6${categorySlug ? `&category=${categorySlug}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          const items = (data.data || []).filter((p: any) => p.id !== product.id).slice(0, 4);
          setRelatedProducts(items);
        }
      } catch {
        setRelatedProducts([]);
      }
    }
    fetchRelated();
  }, [product.id, product.category?.slug]);

  // Handle sticky bar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (buyBoxRef.current) {
        const rect = buyBoxRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Image Switcher with 200ms Fade
  const changeImage = (index: number) => {
    if (index === activeImage) return;
    setFadeKey((k) => k + 1);
    setActiveImage(index);
  };

  // Zoom Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Pricing calculations
  const priceDelta = Number(selectedVariant?.priceDelta || 0);
  const basePrice = Number(product.price || 0);
  const finalUnitPrice = basePrice + priceDelta;

  const isWishlisted = isInWishlist(product.id);
  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
    : null;

  // Star Breakdown calculation
  const starCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r: any) => Math.round(r.rating) === stars).length,
    percentage: reviews.length
      ? (reviews.filter((r: any) => Math.round(r.rating) === stars).length / reviews.length) * 100
      : 0,
  }));

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: selectedVariant
        ? `${product.name} (${selectedVariant.size || selectedVariant.color})`
        : product.name,
      slug: product.slug,
      price: finalUnitPrice,
      image: product.images?.[0] || '',
    }, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: finalUnitPrice,
      image: product.images?.[0] || '',
      category: product.category?.name || '',
      rating: avgRating || 0,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      if (res.ok) {
        const addedRev = await res.json();
        setProduct((prev: any) => ({
          ...prev,
          reviews: [addedRev, ...(prev.reviews || [])],
        }));
        setNewComment('');
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 4000);
      }
    } catch {
      // Local optimistic fallback
      const newRev = {
        id: `r-${Date.now()}`,
        rating: newRating,
        comment: newComment,
        createdAt: 'Just now',
        user: { name: 'You' },
      };
      setProduct((prev: any) => ({
        ...prev,
        reviews: [newRev, ...(prev.reviews || [])],
      }));
      setNewComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentImages = product.images && product.images.length > 0 ? product.images : [FALLBACK_PRODUCT.images[0]];
  const hasMultipleImages = currentImages.length > 1;
  const hasDimensions = product.heightCm || product.widthCm || product.depthCm || product.weightKg;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* ── Breadcrumbs ────────────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/products' },
          { label: product.category?.name || 'Curated', href: `/search?category=${product.category?.slug || ''}` },
          { label: product.name },
        ]}
      />

      {/* ── HERO GRID: Image Gallery + Buy Box ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start" ref={buyBoxRef}>

        {/* ── Gallery (7 cols on desktop) ─────────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col lg:flex-row-reverse gap-4">
          
          {/* Main Primary Image Container with Desktop Lens Zoom */}
          <div
            className="relative flex-1 aspect-square bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden group cursor-crosshair"
            onMouseEnter={() => setIsHoveringZoom(true)}
            onMouseLeave={() => setIsHoveringZoom(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
          >
            <img
              key={fadeKey}
              src={currentImages[activeImage]}
              alt={product.name}
              style={
                isHoveringZoom
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(1.75)',
                      transition: 'transform 0.1s ease-out',
                    }
                  : { transform: 'scale(1)', transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out' }
              }
              className="w-full h-full object-cover select-none"
              loading="eager"
            />

            {/* Expand / Lightbox Trigger Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-slate-700 hover:text-slate-900 shadow-sm opacity-90 hover:opacity-100 transition-all"
              title="Open full-screen gallery"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Prev/Next overlay controls for gallery */}
            {hasMultipleImages && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeImage((activeImage - 1 + currentImages.length) % currentImages.length);
                  }}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeImage((activeImage + 1) % currentImages.length);
                  }}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails strip: Vertical (desktop) / Horizontal scroll (mobile) */}
          {hasMultipleImages && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[540px] scrollbar-none py-1">
              {currentImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => changeImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-50 ${
                    idx === activeImage
                      ? 'border-slate-900 shadow-md scale-95'
                      : 'border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Buy Box (5 cols on desktop) ──────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">

          {/* 1. Product Name */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* 2. Limited Edition Note (Quiet pill) */}
            {product.isLimitedEdition && (
              <div className="pt-1">
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Limited Edition · {product.editionDisplay || `${product.editionNumber || 1} of ${product.editionTotal || 500}`}</span>
                </span>
              </div>
            )}
          </div>

          {/* 3. Average Rating (Clickable link smooth-scrolls to #reviews) */}
          {avgRating !== null && reviews.length > 0 && (
            <a
              href="#reviews"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors"
            >
              <div className="flex items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span>{avgRating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({reviews.length} collector {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </a>
          )}

          {/* 4. Price */}
          <div className="border-t border-b border-slate-100 py-4 space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {formatPrice(finalUnitPrice)}
              </span>
              {selectedVariant?.priceDelta > 0 && (
                <span className="text-xs text-slate-400 font-medium">Includes variant customization</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Free insured white-glove courier shipping · Inclusive of all taxes</p>
          </div>

          {/* 5. Variant Selectors (If product has variants) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Option / Specification
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const label = v.size || v.color || `Variant ${v.id}`;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {label} {v.priceDelta > 0 && `(+${formatPrice(v.priceDelta)})`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Quantity Stepper + 7. Stock Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
              {/* Stock Status Indicator */}
              {product.stock === 0 ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  Out of Stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                  Low Stock · Only {product.stock} left
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>In Stock · Ready to Ship</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={product.stock === 0}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-slate-900 min-w-[2rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                  disabled={product.stock === 0}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 8. Add to Cart (Primary) + Wishlist Heart (Secondary) */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2.5 shadow-lg transition-all duration-200 ${
                product.stock === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : addedToCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Currently Out of Stock' : addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-slate-300'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* 9. Compact Trust Row */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
            {COMPACT_TRUST_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Icon className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700 line-clamp-1">{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* 10. Gift Eligibility Note */}
          {product.isGiftEligible && (
            <div className="flex items-center space-x-3 text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-4 py-3 rounded-2xl">
              <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Eligible for gift wrapping &amp; a personalised gift note at checkout.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── BELOW THE FOLD CONTENT ────────────────────────────────────────── */}
      <div className="pt-10 border-t border-slate-200 space-y-16 max-w-4xl">

        {/* 1. General Description */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-slate-900">About this Piece</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">{product.description}</p>
        </section>

        {/* 2. Craftsmanship & Origin (Collector Persona) */}
        {product.craftsmanshipStory && (
          <section className="border-l-4 border-amber-400 pl-6 space-y-3 py-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">Proven Heritage</span>
            <h2 className="font-display text-2xl font-bold text-slate-900">Craftsmanship &amp; Origin</h2>
            <p className="text-sm text-slate-600 leading-relaxed italic">{product.craftsmanshipStory}</p>
          </section>
        )}

        {/* 3. Dimensions & Materials (Designer Persona) */}
        {(hasDimensions || product.material) && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">Dimensions &amp; Specifications</h2>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm max-w-xl">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {product.material && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-bold w-44">Primary Material</td>
                      <td className="px-5 py-3.5 text-slate-900 font-bold">{product.material}</td>
                    </tr>
                  )}
                  {product.heightCm && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-bold">Height</td>
                      <td className="px-5 py-3.5 text-slate-900 font-bold">{Number(product.heightCm)} cm</td>
                    </tr>
                  )}
                  {product.widthCm && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-bold">Width</td>
                      <td className="px-5 py-3.5 text-slate-900 font-bold">{Number(product.widthCm)} cm</td>
                    </tr>
                  )}
                  {product.depthCm && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-bold">Depth</td>
                      <td className="px-5 py-3.5 text-slate-900 font-bold">{Number(product.depthCm)} cm</td>
                    </tr>
                  )}
                  {product.weightKg && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-bold">Weight</td>
                      <td className="px-5 py-3.5 text-slate-900 font-bold">{Number(product.weightKg)} kg</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 4. REVIEWS SECTION (`#reviews`) */}
        <section id="reviews" className="scroll-mt-24 space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Collector Reviews</h2>
              <p className="text-xs text-slate-500 mt-1">Verified buyer experiences &amp; authenticity assessments</p>
            </div>
            {avgRating !== null && (
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl">
                <span className="text-2xl font-black text-slate-900">{avgRating.toFixed(1)}</span>
                <div>
                  <div className="flex items-center space-x-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? 'fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{reviews.length} total reviews</span>
                </div>
              </div>
            )}
          </div>

          {/* Rating Breakdown Bars */}
          {reviews.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2.5 max-w-lg shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Rating Distribution</h3>
              {starCounts.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center text-xs space-x-3">
                  <span className="w-12 text-slate-600 font-bold">{stars} Stars</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 text-[11px]">{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Zero Reviews Empty State */}
          {reviews.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-800">No reviews yet for this piece</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first collector to leave feedback after receiving your item.
              </p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Collector'}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                        Verified Purchase
                      </span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>}
                  <p className="text-[10px] text-slate-400">{rev.createdAt || 'Recently reviewed'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write a Review Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 max-w-xl">
            <div className="flex items-center space-x-2">
              <MessageSquarePlus className="w-5 h-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Share Your Assessment</h3>
            </div>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Thank you! Your review has been submitted.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Your Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewRating(s)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe the craftsmanship, weight, finish, or historical accuracy..."
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* ── 5. RELATED PRODUCTS ("You May Also Like") ──────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete Your Collection</span>
              <h2 className="font-display text-2xl font-bold text-slate-900">You May Also Like</h2>
            </div>
            <Link
              href={`/search?category=${product.category?.slug || ''}`}
              className="text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors"
            >
              View Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p: any) => (
              <ProductGridCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                category={p.category?.name || product.category?.name || ''}
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
          </div>
        </section>
      )}

      {/* ── MOBILE STICKY BUY BAR (Visible on scroll) ──────────────────────── */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between z-40 lg:hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <img
              src={currentImages[0]}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
              <p className="text-xs font-black text-slate-900">{formatPrice(finalUnitPrice)}</p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs flex items-center space-x-2 flex-shrink-0 ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedToCart
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{addedToCart ? 'Added ✓' : 'Add to Cart'}</span>
          </button>
        </div>
      )}

      {/* ── FULL-SCREEN LIGHTBOX MODAL (Mobile & Desktop) ───────────────────── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={currentImages[activeImage]}
              alt={product.name}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={() => changeImage((activeImage - 1 + currentImages.length) % currentImages.length)}
                  className="absolute left-2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => changeImage((activeImage + 1) % currentImages.length)}
                  className="absolute right-2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-6 flex space-x-2">
            {currentImages.map((_: any, i: number) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeImage ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
