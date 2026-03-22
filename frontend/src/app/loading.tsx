export default function Loading() {
  return (
    <div className="container-wrap py-12 animate-fade-in">
      {/* Skeleton header */}
      <div className="skeleton h-5 w-48 mb-6" />
      <div className="skeleton h-10 w-3/4 mb-3" />
      <div className="skeleton h-4 w-1/2 mb-8" />

      {/* Skeleton cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card !p-5 space-y-3">
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-3 w-1/2 mt-2" />
            <div className="flex gap-2 mt-3">
              <div className="skeleton h-3 w-14 rounded-full" />
              <div className="skeleton h-3 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
