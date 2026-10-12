'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingBag, Shield } from 'lucide-react';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  rating?: number;
  reviewsCount?: number;
  image: string;
  images?: string[];
  stock?: number;
  material?: string;
  isLimitedEdition?: boolean;
  editionNumber?: number | null;
  editionTotal?: number | null;
  viewMode?: 'grid' | 'list';
}

export default function ProductGridCard({
  id,
  name,
  slug,
  category,
  price,
  rating = 5.0,
  reviewsCount = 0,
  image,
  images,
  stock = 10,
  isLimitedEdition,
  editionNumber,
  editionTotal,
  viewMode = 'grid',
}: ProductCardProps) {
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const addToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isWishlisted = isInWishlist(id);

  const primaryImage = images?.[0] || image;
  const secondaryImage = images?.[1] || null;
  const isOutOfStock = stock === 0;
  const showEditionBadge = isLimitedEdition && editionNumber != null && editionTotal != null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart({ id, productId: id, name, slug, price, image: primaryImage }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({ id, name, slug, price, image: primaryImage, category, rating });
  };

  // 5-Star Rating Line matching reference catalog
  const renderStars = () => {
    const starCount = 5;
    const filledStars = Math.round(rating || 0);

    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center space-x-0.5">
          {Array.from({ length: starCount }).map((_, index) => {
            const isFilled = index < filledStars && reviewsCount > 0;
            return (
              <Star
                key={index}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-300'
                }`}
              />
            );
          })}
        </div>
        <span className="text-[11px] sm:text-[12px] text-slate-500 font-normal ml-0.5">
          ({reviewsCount})
        </span>
      </div>
    );
  };

  /* ─── LIST VIEW MODE ─── */
  if (viewMode === 'list') {
    return (
      <div
        className="group flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl hover:bg-slate-50/80 transition-all duration-150 relative border-b border-slate-100 last:border-b-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative w-full sm:w-56 aspect-square bg-[#F7F5F0] overflow-hidden flex-shrink-0">
          <Link href={`/products/${slug}`} className="block w-full h-full">
            {!imgError ? (
              <img
                src={primaryImage}
                alt={name}
                onError={() => setImgError(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-in-out ${
                  secondaryImage && hovered ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                <Shield className="w-8 h-8 opacity-40 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Piece Preview</span>
              </div>
            )}
            {secondaryImage && !imgError && (
              <img
                src={secondaryImage}
                alt={`${name} — alternate view`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-in-out ${
                  hovered ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
              />
            )}
          </Link>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-slate-800 text-[11px] font-bold tracking-widest uppercase bg-white/90 px-3 py-1 shadow-sm">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between w-full space-y-2 sm:space-y-3">
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {category}
            </span>
            <Link
              href={`/products/${slug}`}
              className="block font-display text-lg sm:text-xl text-slate-900 hover:text-amber-700 transition-colors"
            >
              {name}
            </Link>
            {renderStars()}
          </div>

          <div className="flex items-baseline space-x-3 pt-1">
            <span className="text-lg sm:text-xl font-bold text-slate-900">{formatPrice(price)}</span>
            {showEditionBadge && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Edition {editionNumber}/{editionTotal}
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleWishlist}
            className={`p-2.5 sm:p-3 rounded-lg border transition-all duration-150 ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-slate-300'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-2 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : added ? 'Added ✓' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ─── GRID VIEW MODE (Exact YIOSI reference aesthetic for Desktop AND Mobile) ─── */
  return (
    <div
      className="group flex flex-col justify-between h-full relative select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-[#FAF8F5] overflow-hidden">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          {!imgError ? (
            <img
              src={primaryImage}
              alt={name}
              onError={() => setImgError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-in-out group-hover:scale-[1.02] ${
                secondaryImage && hovered ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 opacity-30 mb-1" />
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-60">Piece Preview</span>
            </div>
          )}
          {secondaryImage && !imgError && (
            <img
              src={secondaryImage}
              alt={`${name} — alternate view`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-in-out group-hover:scale-[1.02] ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
        </Link>

        {/* Subtle Wishlist Heart */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full transition-all duration-150 ${
            isWishlisted
              ? 'bg-white text-rose-500 shadow-sm opacity-100'
              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white opacity-0 group-hover:opacity-100'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Limited Edition Quiet Pill */}
        {showEditionBadge && (
          <span className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 bg-black/75 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 tracking-wider uppercase">
            {editionNumber}/{editionTotal}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3.5 py-1 tracking-widest uppercase">
              Sold Out
            </span>
          </div>
        )}

        {/* Desktop Quick Add Overlay on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden sm:block">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-4 font-medium text-xs flex items-center justify-center space-x-2 shadow-md transition-all duration-150 ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-900/90 backdrop-blur-sm text-white hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{added ? 'Added to Cart ✓' : 'Quick Add'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Typography & Info — Exact Reference Layout (Same for Mobile & Desktop) */}
      <div className="pt-2 sm:pt-3 pb-1 flex-1 flex flex-col justify-between space-y-1">
        <div>
          {/* Product Name in Cormorant Garamond Serif */}
          <Link
            href={`/products/${slug}`}
            className="block font-display text-[13px] sm:text-[16px] text-slate-900 leading-snug hover:text-amber-700 transition-colors line-clamp-2"
          >
            {name}
          </Link>

          {/* 5-Star Rating Line */}
          <div className="mt-0.5 sm:mt-1">
            {renderStars()}
          </div>

          {/* Formatted Price */}
          <div className="mt-1 sm:mt-1.5 flex items-baseline">
            <span className="text-[13px] sm:text-[16px] font-bold text-slate-900 tracking-tight">
              {formatPrice(price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
