"use client"

import Link from "next/link"
import { Coins } from "lucide-react"
import { useCreditsBalance } from "@/modules/credits/hooks/use-credits"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
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
    <Button variant="primary">

    <Link
      href="/billing"
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        isLow
          ??"border-amber-500/30 bg-[#d9502e] text-white hover:bg-amber-500/20"
          
      )}
    >
      <Coins size={13}  />
      {isLoading ? (
        <Skeleton className="h-3 w-8" />
      ) : (
        <span>{balance} credits</span>
      )}
    </Link>
    </Button>
  )
}
