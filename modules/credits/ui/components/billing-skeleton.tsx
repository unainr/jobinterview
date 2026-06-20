import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function BillingSkeleton() {
  const card = "rounded-2xl bg-white dark:bg-[#131312] ring-1 ring-[#161510]/[0.07] dark:ring-white/[0.08]"

  return (
    <main className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a] relative py-6">
      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-5%] right-[8%] w-[35%] h-[40%] rounded-full opacity-[0.1] dark:opacity-[0.08] blur-3xl"
          style={{ background: "radial-gradient(circle, #c8d92e, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-5">
        {/* hero balance card */}
        <div className={cn(card, "p-6 flex items-center justify-between flex-wrap gap-4")}>
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-2xl" />
            <div>
              <Skeleton className="h-3.5 w-24 mb-2.5" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* usage note */}
        <div className="px-1 py-1">
          <Skeleton className="h-3.5 w-full max-w-[320px]" />
        </div>

        {/* plans */}
        <div className="space-y-3 pt-2">
          <Skeleton className="h-5 w-16 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(card, "p-5 flex flex-col gap-4")}>
                <div>
                  <Skeleton className="h-3.5 w-16 mb-2.5" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-3 flex-1 mt-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-[90%]" />
                  <Skeleton className="h-3 w-[80%]" />
                </div>
                <Skeleton className="h-10 w-full rounded-full mt-4" />
              </div>
            ))}
          </div>
        </div>

        {/* transaction history */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-5 w-40 mb-3" />
          <div className={cn(card, "divide-y divide-[#161510]/6 dark:divide-white/8 overflow-hidden")}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div>
                    <Skeleton className="h-3.5 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
