import { Instagram } from 'lucide-react';

const INSTAGRAM_POSTS = [
  {
    image: 'https://images.unsplash.com/photo-1599753587042-50d4d293883a?q=80&w=600',
    handle: '@storefront_artisan',
    caption: 'Templar Knight Armor displayed in private study room.',
  },
  {
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600',
    handle: '@storefront_artisan',
    caption: 'Nordic Viking Battle Axe hand-engraved detailing.',
  },
  {
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600',
    handle: '@storefront_artisan',
    caption: 'Roman Centurion Brass Helmet on display stand.',
  },
  {
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600',
    handle: '@storefront_artisan',
    caption: 'Gothic antique candle holders for home decor.',
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600',
    handle: '@storefront_artisan',
    caption: 'Handcrafted solid oak medieval library chair.',
  },
];

export default function InstagramGallery() {
  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest">
            <Instagram className="w-4 h-4" />
            <span>Community Gallery</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Follow Us On Instagram
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Tag <span className="font-bold text-slate-800">@storefront_artisan</span> to be featured in our collector showcase.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 shadow-sm block"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                <Instagram className="w-6 h-6 text-amber-400 mb-2" />
                <span className="text-[11px] font-bold text-white">{post.handle}</span>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{post.caption}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
