'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingBag } from 'lucide-react';
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
}

export default function ProductGridCard({
  id,
  name,
  slug,
  category,
  price,
  rating,
  reviewsCount,
  image,
  images,
  stock = 10,
  isLimitedEdition,
  editionNumber,
  editionTotal,
}: ProductCardProps) {
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const addToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isWishlisted = isInWishlist(id);

  const primaryImage = images?.[0] || image;
  const secondaryImage = images?.[1] || null;
  const isOutOfStock = stock === 0;
  const showRating = rating !== undefined && rating > 0 && (reviewsCount ?? 0) > 0;
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

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between h-full relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container — cross-fade to second image on hover */}
      <div className={`relative aspect-square bg-slate-50 overflow-hidden ${isOutOfStock ? 'opacity-60' : ''}`}>
        <Link href={`/products/${slug}`} className="block w-full h-full">
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-200 ease-in-out group-hover:scale-105 ${
              secondaryImage && hovered ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {/* Secondary image (cross-fade in on hover) */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${name} — alternate view`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-200 ease-in-out group-hover:scale-105 ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
        </Link>

        {/* Category Badge — top-left */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {category}
        </span>

        {/* Wishlist Icon — top-right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-150 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 shadow-sm'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Limited Edition Badge — bottom-left, quiet pill */}
        {showEditionBadge && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200/80">
            {editionNumber} of {editionTotal}
          </span>
        )}

        {/* Out of Stock label */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur-md text-slate-600 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover: Add to Cart button (desktop only) */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden sm:block">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all duration-150 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{added ? 'Added to Cart ✓' : 'Add to Cart'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Product Name */}
          <Link href={`/products/${slug}`} className="block font-bold text-slate-900 text-sm hover:text-amber-600 transition-colors line-clamp-1">
            {name}
          </Link>

          {/* Rating — only shown if reviewsCount > 0 */}
          {showRating && (
            <div className="flex items-center space-x-1.5 mt-1.5">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-900 ml-1">{rating!.toFixed(1)}</span>
              </div>
              <span className="text-[11px] text-slate-400">({reviewsCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-baseline text-slate-900">
            <span className="text-xl font-black">{formatPrice(price)}</span>
          </div>
        </div>

        {/* Mobile persistent Add to Cart button */}
        <div className="block sm:hidden pt-1">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-150 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : added ? 'Added to Cart ✓' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
