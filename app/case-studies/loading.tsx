export default function CaseStudiesLoading() {
  return (
    <main className="min-h-screen bg-[#0d0f0d]">
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Title skeleton */}
          <div className="h-10 w-56 animate-pulse rounded-lg bg-[#1e201e] mb-8" />

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#3d4949]/20 bg-[#121412] p-4 space-y-4">
                <div className="aspect-video animate-pulse rounded-xl bg-[#1e201e]" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#1e201e]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#1e201e]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
