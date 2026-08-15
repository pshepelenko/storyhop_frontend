export default function LibraryLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading library">
      <div className="flex justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-8 w-40 bg-sh-border/60 rounded-lg" />
          <div className="h-4 w-64 max-w-full bg-sh-border/40 rounded" />
        </div>
        <div className="h-11 w-32 bg-sh-border/60 rounded-[var(--sh-radius)] shrink-0" />
      </div>

      <div className="h-44 lg:h-52 rounded-[var(--sh-radius-lg)] bg-sh-border/50" />

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-9 w-20 bg-sh-border/50 rounded-full shrink-0" />
        ))}
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-28 rounded-[var(--sh-radius-lg)] bg-sh-border/40" />
        ))}
      </div>
    </div>
  );
}
