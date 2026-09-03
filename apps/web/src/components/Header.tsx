'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Search, ShoppingBag, Heart, ChevronDown, User, Globe, Shield, Clock, Home, Award, BookOpen, Tag, Layers, ArrowRight, X } from 'lucide-react';
import { useCurrencyStore, CurrencyCode } from '@/store/useCurrencyStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { API_URL } from '@/lib/api';

const COLLECTIONS = [
  { name: 'Medieval', href: '/collections/medieval' },
  { name: 'Viking', href: '/collections/viking' },
  { name: 'Roman', href: '/collections/roman' },
  { name: 'Home Décor', href: '/collections/home-decor' },
  { name: 'Collectibles', href: '/collections/collectibles' },
  { name: 'Furniture', href: '/collections/furniture' },
];

const TAXONOMY_TREE = [
  {
    category: 'Medieval',
    slug: 'medieval',
    icon: Shield,
    subcategories: [
      { name: 'Shields', href: '/products?category=medieval&sub=shields' },
      { name: 'Helmets', href: '/products?category=medieval&sub=helmets' },
      { name: 'Armor', href: '/products?category=medieval&sub=armor' },
      { name: 'Accessories', href: '/products?category=medieval&sub=accessories' },
    ],
  },
  {
    category: 'Vintage',
    slug: 'vintage',
    icon: Clock,
    subcategories: [
      { name: 'Clocks', href: '/products?category=vintage&sub=clocks' },
      { name: 'Telescopes', href: '/products?category=vintage&sub=telescopes' },
      { name: 'Journals', href: '/products?category=vintage&sub=journals' },
      { name: 'Compasses', href: '/products?category=vintage&sub=compasses' },
    ],
  },
  {
    category: 'Home Décor',
    slug: 'home-decor',
    icon: Home,
    subcategories: [
      { name: 'Wall Art', href: '/products?category=home-decor&sub=wall-art' },
      { name: 'Lighting', href: '/products?category=home-decor&sub=lighting' },
      { name: 'Sculptures', href: '/products?category=home-decor&sub=sculptures' },
      { name: 'Furniture', href: '/products?category=home-decor&sub=furniture' },
    ],
  },
  {
    category: 'Collectibles',
    slug: 'collectibles',
    icon: Award,
    subcategories: [
      { name: 'Limited Editions', href: '/products?tag=limited-edition' },
      { name: 'Artisan Weapons', href: '/products?category=collectibles&sub=weapons' },
      { name: 'Historical Relics', href: '/products?category=collectibles&sub=relics' },
      { name: 'View All Collectibles', href: '/products?category=collectibles' },
    ],
  },
];

const MOCK_SUGGESTIONS: Record<string, { products: any[]; collections: any[]; categories: any[]; articles: any[] }> = {
  spa: {
    products: [
      { id: 'p-sp1', name: 'Spartan Bronze Round Shield', slug: 'spartan-shield-bronze-24', price: 14999, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=200' },
      { id: 'p-sp2', name: 'Spartan Officer Crested Helmet', slug: 'spartan-officer-helmet', price: 8999, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=200' },
      { id: 'p-sp3', name: 'Spartan Hoplite Battle Spear', slug: 'spartan-hoplite-spear', price: 6499, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200' },
    ],
    collections: [{ name: 'Spartan Collection', slug: 'spartan-collection' }],
    categories: [{ name: 'Medieval', slug: 'medieval' }],
    articles: [{ title: 'History of Spartan Warriors', slug: 'history-of-spartan-warriors' }],
  },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [shopMegaOpen, setShopMegaOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<{ products: any[]; collections: any[]; categories: any[]; articles: any[] } | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { currency, setCurrency } = useCurrencyStore();
  const totalCartItems = useCartStore((s) => s.totalItems());
  const wishlistItemsCount = useWishlistStore((s) => s.items.length);

  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 35);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    const q = value.trim().toLowerCase();

    if (q.length < 2) {
      setSuggestions(null);
      setSuggestOpen(false);
      return;
    }

    setSuggestOpen(true);

    if (MOCK_SUGGESTIONS[q]) {
      setSuggestions(MOCK_SUGGESTIONS[q]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/suggest?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      } else {
        setSuggestions({
          products: [
            { id: 'p-1', name: `Spartan Shield (${value})`, slug: 'spartan-shield-bronze-24', price: 14999, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=200' },
          ],
          collections: [{ name: `${value.toUpperCase()} Collection`, slug: value.toLowerCase() }],
          categories: [{ name: 'Medieval', slug: 'medieval' }],
          articles: [{ title: `History of ${value}`, slug: `history-of-${value}` }],
        });
      }
    } catch {
      setSuggestions({
        products: [
          { id: 'p-1', name: 'Spartan Shield', slug: 'spartan-shield-bronze-24', price: 14999, image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=200' },
        ],
        collections: [{ name: 'Spartan Collection', slug: 'spartan' }],
        categories: [{ name: 'Medieval', slug: 'medieval' }],
        articles: [{ title: 'History of Spartan Warriors', slug: 'history-of-spartan-warriors' }],
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSuggestOpen(false);
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isNavActive = (href: string) => {
    if (href === '/products' && pathname === '/products') return true;
    if (href !== '/' && href !== '/products' && pathname.startsWith(href)) return true;
    return false;
  };

  // Always light nav — no transparent dark mode
  const isTransparentTop = false;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div
        className={`bg-[#fafafa] text-neutral-700 text-xs py-2 px-4 transition-all duration-300 border-b border-neutral-200 ${
          isScrolled ? 'h-0 py-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium tracking-wide">
          <div className="hidden sm:block" />
          <p className="text-center flex-1 text-[11px] uppercase tracking-wider text-neutral-600">⚡ FREE WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER ₹1,999</p>

          <div className="flex items-center space-x-1 bg-neutral-100 px-2.5 py-0.5 rounded-full text-[11px]">
            <Globe className="w-3 h-3 text-neutral-500" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-neutral-800 font-bold cursor-pointer focus:outline-none text-[11px]"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar — Section 10: Transparent at top of homepage, white + shadow after scroll */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md text-neutral-900 border-b border-neutral-200 shadow-sm py-1'
            : 'bg-white text-neutral-900 border-b border-neutral-100 py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2" title="Corazonetouch Homepage">
              <span>🛡️</span>
              <span className="font-display">CORAZONETOUCH</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
              
              {/* Shop Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setShopMegaOpen(true)}
                onMouseLeave={() => setShopMegaOpen(false)}
              >
                <Link
                  href="/products"
                  className={`flex items-center space-x-1 py-2 transition-colors uppercase tracking-wider ${
                    isNavActive('/products')
                      ? isTransparentTop ? 'text-white font-black border-b-2 border-amber-400' : 'text-slate-900 font-black border-b-2 border-amber-500'
                      : isTransparentTop ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Link>

                {shopMegaOpen && (
                  <div className="absolute top-full -left-12 w-[720px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 grid grid-cols-4 gap-6 normal-case text-slate-900">
                    {TAXONOMY_TREE.map((group) => {
                      const Icon = group.icon;
                      return (
                        <div key={group.category} className="space-y-3">
                          <Link
                            href={`/products?category=${group.slug}`}
                            className="flex items-center space-x-2 text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors border-b border-slate-100 pb-2"
                          >
                            <Icon className="w-4 h-4 text-amber-500" />
                            <span>{group.category}</span>
                          </Link>
                          <ul className="space-y-1.5 text-xs">
                            {group.subcategories.map((sub) => (
                              <li key={sub.name}>
                                <Link
                                  href={sub.href}
                                  className="text-slate-600 hover:text-slate-900 hover:font-semibold transition-colors block py-0.5"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Collections Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button className={`flex items-center space-x-1 py-2 transition-colors uppercase tracking-wider ${
                  isNavActive('/collections')
                    ? isTransparentTop ? 'text-white font-black border-b-2 border-amber-400' : 'text-slate-900 font-black border-b-2 border-amber-500'
                    : isTransparentTop ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}>
                  <span>Collections</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {collectionsOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 normal-case text-slate-900">
                    {COLLECTIONS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/products?tag=new-arrivals" className={isTransparentTop ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                New Arrivals
              </Link>
              <Link href="/products?tag=best-sellers" className={isTransparentTop ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                Best Sellers
              </Link>
              <Link href="/pages/about" className={isTransparentTop ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                About
              </Link>
              <Link href="/blog" className={isTransparentTop ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
                Journal
              </Link>
            </nav>

            {/* Utility Actions */}
            <div className="flex items-center space-x-3">
              <div ref={searchRef} className="relative hidden md:block">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && setSuggestOpen(true)}
                    className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#fafafa] text-neutral-900 placeholder-neutral-400 border border-neutral-200 focus:bg-white focus:border-neutral-300 focus:outline-none transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </form>

                {suggestOpen && suggestions && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-4 space-y-4 text-xs text-slate-900">
                    {suggestions.products.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Tag className="w-3 h-3 text-amber-500" />
                          <span>Products</span>
                        </div>
                        <div className="space-y-2">
                          {suggestions.products.map((p) => (
                            <Link key={p.id} href={`/products/${p.slug}`} onClick={() => setSuggestOpen(false)} className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group">
                              <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">{p.name}</p>
                                <p className="text-[10px] text-slate-500">₹{p.price.toLocaleString('en-IN')}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {suggestions.collections.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          <span>Collections</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.collections.map((c) => (
                            <Link key={c.slug} href={`/collections/${c.slug}`} onClick={() => setSuggestOpen(false)} className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {suggestions.articles.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <BookOpen className="w-3 h-3 text-emerald-500" />
                          <span>Journal Articles</span>
                        </div>
                        <div className="space-y-1">
                          {suggestions.articles.map((a) => (
                            <Link key={a.slug} href={`/journal/${a.slug}`} onClick={() => setSuggestOpen(false)} className="block text-slate-700 hover:text-slate-900 font-medium hover:underline py-0.5 truncate">
                              {a.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 text-center">
                      <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} onClick={() => setSuggestOpen(false)} className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center space-x-1">
                        <span>See all results for &quot;{searchQuery}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className={`md:hidden p-2 transition-colors ${isTransparentTop ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`}
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account */}
              <SignedIn>
                <div className="flex items-center space-x-1">
                  <Link href="/account" className={`p-2 transition-colors ${isTransparentTop ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`} title="My Account">
                    <User className="w-5 h-5" />
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>

              <SignedOut>
                <Link href="/sign-in" className={`p-2 transition-colors ${isTransparentTop ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`} title="Sign In / Account">
                  <User className="w-5 h-5" />
                </Link>
              </SignedOut>

              {/* Wishlist */}
              <Link href="/wishlist" className={`p-2 transition-colors relative ${isTransparentTop ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`} title="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-neutral-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className={`p-2 transition-colors relative ${isTransparentTop ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`} title="Shopping Cart">
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute top-1 right-1 bg-neutral-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </Link>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col p-4 md:hidden">
          <div className="bg-white rounded-2xl p-4 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Search Catalog &amp; Lore</span>
              <button onClick={() => setMobileSearchOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Type search terms (e.g. spartan)..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
