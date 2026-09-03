export default function HomepageSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-96 bg-slate-900 rounded-3xl max-w-7xl mx-auto my-6" />

      {/* Category Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-96 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
