'use client';

import Link from 'next/link';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 max-w-md mx-auto shadow-sm">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Your Wishlist is Empty</h1>
          <p className="text-xs text-slate-500 mt-2 mb-6">Save your favorite historical armor and collectibles to view them later.</p>
          <Link
            href="/products"
            className="inline-block bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Saved Wishlist ({items.length} items)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="relative aspect-square bg-slate-100">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 shadow-sm hover:bg-rose-50 transition-colors"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{item.category}</span>
                <Link href={`/products/${item.slug}`} className="block font-bold text-slate-900 text-sm hover:text-amber-600 line-clamp-2 mt-1">
                  {item.name}
                </Link>
                <span className="block text-xl font-black text-slate-900 mt-2">₹{item.price.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => {
                  addItemToCart({
                    id: item.id,
                    productId: item.id,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image,
                  });
                }}
                className="mt-4 w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
