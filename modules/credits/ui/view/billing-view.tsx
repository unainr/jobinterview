"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCreditsBalance, useCreditTransactions } from "@/modules/credits/hooks/use-credits"
import { useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Coins, ArrowDownRight, ArrowUpRight, Check } from "lucide-react"
import { PLANS } from "@/lib/plan-config"
import { toast } from "sonner"

// ─────────────────────────────────────────────
// PLAN DISPLAY CONFIG
// Pricing shown here is for UI only — actual price is set in Polar dashboard
// ─────────────────────────────────────────────

const PLAN_DISPLAY = [
  {
    id: "free" as const,
    price: "$0",
    period: "forever",
    features: ["20 credits / month", "1 AI agent", "Chat & voice interviews"],
  },
  {
    id: "pro" as const,
    price: "$15",
    period: "/month",
    popular: true,
    features: ["100 credits / month", "5 AI agents", "Chat & voice interviews", "Priority support"],
  },
  {
    id: "premium" as const,
    price: "$35",
    period: "/month",
    features: ["250 credits / month", "Unlimited agents", "Chat & voice interviews", "Priority support", "Public agent links"],
  },
]

export default function BillingView() {
  const { data: credits, isLoading: balanceLoading } = useCreditsBalance()
  const { data: transactions, isLoading: txLoading } = useCreditTransactions()
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()
  const confirmCalled = useRef(false)

  const currentPlan = credits?.plan ?? "free"

  // ─────────────────────────────────────────────
  // After Polar redirects back with ?success=true&checkoutId=xxx,
  // call /api/checkout/confirm to verify the payment and grant credits.
  // We use a ref to ensure this only runs once even in Strict Mode.
  // ─────────────────────────────────────────────
  useEffect(() => {
    const isSuccess = searchParams.get("success") === "true"
    const checkoutId = searchParams.get("checkoutId")

    if (!isSuccess || !checkoutId || confirmCalled.current) return
    confirmCalled.current = true

    async function confirmCheckout() {
      const toastId = toast.loading("Confirming your purchase…")
      try {
        const res = await fetch(`/api/checkout/confirm?checkoutId=${checkoutId}`)
        const json = await res.json()

        if (!res.ok) {
          toast.error(json.error ?? "Failed to confirm purchase", { id: toastId })
          return
        }

        toast.success("Plan upgraded! Credits have been added to your account.", { id: toastId })

        // Refresh balance and transactions
        await qc.invalidateQueries({ queryKey: ["credits", "balance"] })
        await qc.invalidateQueries({ queryKey: ["credits", "transactions"] })
      } catch {
        toast.error("Something went wrong confirming your purchase.", { id: toastId })
      } finally {
        // Clean up URL params without a page reload
        const url = new URL(window.location.href)
        url.searchParams.delete("success")
        url.searchParams.delete("checkoutId")
        router.replace(url.pathname + url.search)
      }
    }

    confirmCheckout()
  }, [searchParams, qc, router])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      {/* current balance */}
      <Card className="p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Coins size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current balance</p>
            {balanceLoading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-semibold">{credits?.balance} credits</p>
            )}
          </div>
        </div>
        {!balanceLoading && (
          <Badge variant="secondary" className="text-sm">
            {PLANS[currentPlan].label} Plan
          </Badge>
        )}
      </Card>

      {/* usage note */}
      <p className="text-sm text-muted-foreground">
        Each chat or voice interview session uses <span className="font-medium text-foreground">10 credits</span>.
        Credits reset monthly based on your plan.
      </p>

      {/* plans */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLAN_DISPLAY.map((plan) => {
            const planConfig = PLANS[plan.id]
            const isCurrent = currentPlan === plan.id

            return (
              <Card key={plan.id} className="p-5 flex flex-col gap-4 relative">
                {plan.popular && (
                  <Badge className="absolute -top-2 right-4">Popular</Badge>
                )}

                <div>
                  <p className="text-sm font-medium">{planConfig.label}</p>
                  <p className="text-2xl font-semibold mt-1">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </p>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full">
                    Current plan
                  </Button>
                ) : planConfig.polarProductId ? (
                  <a href={`/api/checkout?products=${planConfig.polarProductId}`}>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.id === "free" ? "Downgrade" : "Upgrade"}
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Free plan
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* transaction history */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transaction history</h2>
        <Card className="divide-y">
          {txLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      tx.amount > 0
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tx.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-medium tabular-nums ${
                    tx.amount > 0 ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}