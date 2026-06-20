"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCreditsBalance, useCreditTransactions } from "@/modules/credits/hooks/use-credits"
import { useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Coins, ArrowDownRight, ArrowUpRight, Check, Zap } from "lucide-react"
import { PLANS } from "@/lib/plan-config"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"

// ─────────────────────────────────────────────
// PLAN DISPLAY CONFIG
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
    const { isSignedIn } = useUser(); // ← drives credits visibility
  

  const currentPlan = credits?.plan ?? "free"

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
        await qc.invalidateQueries({ queryKey: ["credits", "balance"] })
        await qc.invalidateQueries({ queryKey: ["credits", "transactions"] })
      } catch {
        toast.error("Something went wrong confirming your purchase.", { id: toastId })
      } finally {
        const url = new URL(window.location.href)
        url.searchParams.delete("success")
        url.searchParams.delete("checkoutId")
        router.replace(url.pathname + url.search)
      }
    }

    confirmCheckout()
  }, [searchParams, qc, router])

  const card = "rounded-2xl bg-white dark:bg-[#131312] ring-1 ring-[#161510]/[0.07] dark:ring-white/[0.08]"

  return (
    <main className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a] relative py-6">
      {/* ambient glow — same restrained treatment as hero / feedback page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-5%] right-[8%] w-[35%] h-[40%] rounded-full opacity-[0.1] dark:opacity-[0.08] blur-3xl"
          style={{ background: "radial-gradient(circle, #c8d92e, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-5">

        {/* ── hero balance card ── */}
       {
        isSignedIn &&(
           <div className={cn(card, "p-6 flex items-center justify-between flex-wrap gap-4")}>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-[#c8d92e]/15 flex items-center justify-center shrink-0">
              <Coins size={20} className="text-[#8a9417] dark:text-[#c8d92e]" />
            </div>
            <div>
              <p className="text-[12px] text-[#161510]/45 dark:text-white/40 mb-0.5">
                Current balance
              </p>
              {balanceLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p
                  className="text-[28px] font-semibold text-[#161510] dark:text-white tabular-nums tracking-tight"
                  style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
                >
                  {credits?.balance}
                  <span className="text-[15px] font-normal text-[#161510]/40 dark:text-white/35 ml-1.5">
                    credits
                  </span>
                </p>
              )}
            </div>
          </div>

          {!balanceLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#161510]/5 dark:bg-white/8 text-[#161510]/65 dark:text-white/65">
              <Zap size={11} className="text-[#c8d92e]" />
              {PLANS[currentPlan].label} plan
            </span>
          )}
        </div>
        )
       }

        {/* usage note */}
        <p className="text-[13px] text-[#161510]/45 dark:text-white/40 px-1">
          Each chat or voice interview session uses{" "}
          <span className="font-medium text-[#161510]/70 dark:text-white/65">10 credits</span>.
          Credits reset monthly based on your plan.
        </p>

        {/* ── plans ── */}
        <div className="space-y-3 pt-2">
          <h2
            className="text-[19px] font-semibold text-[#161510] dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
          >
            Plans
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLAN_DISPLAY.map((plan) => {
              const planConfig = PLANS[plan.id]
              const isCurrent = currentPlan === plan.id

              return (
                <div
                  key={plan.id}
                  className={cn(
                    card,
                    "p-5 flex flex-col gap-4 relative transition-shadow",
                    plan.popular && "ring-2 ring-[#c8d92e]/40 dark:ring-[#c8d92e]/30",
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[#c8d92e] text-[#161510]">
                      Popular
                    </span>
                  )}

                  <div>
                    <p className="text-[13px] font-medium text-[#161510]/60 dark:text-white/55">
                      {planConfig.label}
                    </p>
                    <p className="text-[28px] font-semibold text-[#161510] dark:text-white mt-1 tracking-tight">
                      {plan.price}
                      <span className="text-[13px] font-normal text-[#161510]/40 dark:text-white/35">
                        {plan.period}
                      </span>
                    </p>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[13px] text-[#161510]/65 dark:text-white/60">
                        <Check size={14} className="text-[#c8d92e] mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-full text-[13px] font-medium bg-[#161510]/5 dark:bg-white/6 text-[#161510]/40 dark:text-white/35 cursor-default"
                    >
                      Current plan
                    </button>
                  ) : planConfig.polarProductId ? (
                    <a href={`/api/checkout?products=${planConfig.polarProductId}`}>
                      <button
                        className={cn(
                          "w-full py-2.5 rounded-full text-[13px] font-medium transition-colors",
                          plan.popular
                            ? "bg-[#161510] dark:bg-[#c8d92e] text-white dark:text-[#161510] hover:bg-[#161510]/85 dark:hover:bg-[#c8d92e]/85"
                            : "ring-1 ring-[#161510]/15 dark:ring-white/15 text-[#161510]/75 dark:text-white/75 hover:bg-[#161510]/3 dark:hover:bg-white/4",
                        )}
                      >
                        {plan.id === "free" ? "Downgrade" : "Upgrade"}
                      </button>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-full text-[13px] font-medium bg-[#161510]/5 dark:bg-white/6 text-[#161510]/40 dark:text-white/35 cursor-default"
                    >
                      Free plan
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── transaction history ── */}
      {
        isSignedIn&&(
            <div className="space-y-3 pt-2">
          <h2
            className="text-[19px] font-semibold text-[#161510] dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
          >
            Transaction history
          </h2>

          <div className={cn(card, "divide-y divide-[#161510]/6 dark:divide-white/8 overflow-hidden")}>
            {txLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="p-10 text-center text-[13px] text-[#161510]/35 dark:text-white/35">
                No transactions yet
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center shrink-0",
                        tx.amount > 0
                          ? "bg-[#c8d92e]/15 text-[#8a9417] dark:text-[#c8d92e]"
                          : "bg-[#161510]/5 dark:bg-white/8 text-[#161510]/45 dark:text-white/45",
                      )}
                    >
                      {tx.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#161510] dark:text-white">
                        {tx.description}
                      </p>
                      <p className="text-[12px] text-[#161510]/40 dark:text-white/35">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      tx.amount > 0
                        ? "text-[#8a9417] dark:text-[#c8d92e]"
                        : "text-[#161510]/45 dark:text-white/40",
                    )}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        )
      }
      </div>
    </main>
  )
}