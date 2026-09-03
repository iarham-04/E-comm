import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  itemCount?: number;
}

export default function CategoryCard({ name, slug, image, itemCount = 24 }: CategoryCardProps) {
  return (
    <Link
      href={`/collections/${slug}`}
      className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block bg-slate-900"
    >
      {/* Background Image with Hover Scale */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-75 group-hover:opacity-85"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

      {/* Card Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
          {itemCount} Artifacts
        </span>
        <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-slate-300 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-medium">
          Explore Collection →
        </p>
      </div>
    </Link>
  );
}
