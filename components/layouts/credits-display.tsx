"use client"

import Link from "next/link"
import { Coins } from "lucide-react"
import { useCreditsBalance } from "@/modules/credits/hooks/use-credits"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// CREDITS DISPLAY
// Shows the user's current credit balance in the navbar.
// Clicking it navigates to /billing.
// ─────────────────────────────────────────────

export function CreditsDisplay() {
  const { data: credits, isLoading } = useCreditsBalance()

  const balance = credits?.balance ?? 0
  const isLow = balance <= 10 && !isLoading

  return (
    <Link
      href="/billing"
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        isLow
          ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          : "border-white/8 bg-white/4 text-muted-foreground hover:text-foreground hover:bg-white/8"
      )}
    >
      <Coins size={13} className={isLow ? "text-amber-500" : "text-primary"} />
      {isLoading ? (
        <Skeleton className="h-3 w-8" />
      ) : (
        <span>{balance} credits</span>
      )}
    </Link>
  )
}
