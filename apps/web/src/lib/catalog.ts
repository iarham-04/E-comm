import { API_URL } from './api';

/** Unsplash photo URL (free for commercial use under the Unsplash License). */
export const photo = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMAGES = {
  almonds: photo('1508061253366-f7da158b6d46'),
  cashews: photo('1723466998040-78d7e2ef6d72'),
  cashewsBowl: photo('1509912760195-4f6cfd8cce2c'),
  cashewsTexture: photo('1573555657105-47a0bb37c3ea'),
  walnuts: photo('1766186471458-840baf8bc04f'),
  walnutsWhole: photo('1644245903028-9b184b04e59e'),
  dates: photo('1691657917109-c6e027eac44a'),
  datesBowl: photo('1648288725055-5ba4063355b9'),
  driedFruit: photo('1693842682673-ef0da9403b06'),
  berries: photo('1524411289573-283bf2f298e8'),
  mixedNuts: photo('1600189020840-e9918c25269d'),
};

export const FALLBACK_IMAGE = IMAGES.mixedNuts;

/** Storefront categories — slugs match the Category table in the database. */
export const CATEGORIES = [
  { name: 'Almonds', slug: 'almonds', image: IMAGES.almonds, blurb: 'Kashmiri Mamra, Californian and Afghan almonds — crunchy, naturally sweet and rich in vitamin E.' },
  { name: 'Cashews', slug: 'cashews', image: IMAGES.cashews, blurb: 'Whole W180–W320 cashews from Goa and Kerala, plain or lightly roasted.' },
  { name: 'Walnuts', slug: 'walnuts', image: IMAGES.walnuts, blurb: 'Light-amber Kashmiri walnut kernels and in-shell walnuts, packed fresh each season.' },
  { name: 'Dates', slug: 'dates', image: IMAGES.dates, blurb: 'Soft Medjool, Ajwa and Kimia dates — nature’s own sweets, no sugar added.' },
  { name: 'Raisins & Berries', slug: 'raisins-berries', image: IMAGES.driedFruit, blurb: 'Afghan black raisins, golden kishmish, cranberries and blueberries.' },
  { name: 'Mixed Nuts', slug: 'mixed-nuts', image: IMAGES.mixedNuts, blurb: 'Balanced everyday mixes of almonds, cashews, walnuts and pistachios.' },
  { name: 'Gift Hampers', slug: 'gift-hampers', image: IMAGES.datesBowl, blurb: 'Festive dry fruit boxes for Diwali, Eid, weddings and corporate gifting.' },
] as const;

export const categoryBySlug = (slug?: string | null) => CATEGORIES.find((c) => c.slug === slug);

/** Maps an API product to ProductGridCard props. Never invents ratings, stock or materials. */
export function toCard(p: any) {
  const reviews: any[] = Array.isArray(p.reviews) ? p.reviews : [];
  const rating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: (typeof p.category === 'object' ? p.category?.name : p.category) || 'Dry Fruits',
    price: Number(p.price) || 0,
    rating,
    reviewsCount: p._count?.reviews ?? reviews.length,
    image: p.images?.[0] || categoryBySlug(p.category?.slug)?.image || FALLBACK_IMAGE,
    images: p.images || [],
    stock: p.stock ?? 0,
    material: p.material || undefined,
    isLimitedEdition: !!p.isLimitedEdition,
  };
}

/** Published products from the API (`GET /products`), mapped for product cards. */
export async function fetchProductCards(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : body?.data ?? [];
  return list.map(toCard);
}
