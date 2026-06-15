// ─────────────────────────────────────────────
// PLAN CONFIG
//
// Each plan maps to a Polar product ID (subscription product)
// and grants a monthly credit allotment.
//
// Free plan has no Polar product — it's the default
// for users with no active subscription.
// ─────────────────────────────────────────────

export const PLANS = {
  free: {
    label: "Free",
    polarProductId: null, // no subscription needed
    monthlyCredits: 20,
  },
  pro: {
    label: "Pro",
    polarProductId: "fcb8ddff-af97-4873-a9f0-8f59f3d63aab",     // ← replace with real Polar product ID
    monthlyCredits: 100,
  },
  premium: {
    label: "Premium",
    polarProductId: "b7fa3c63-6e67-4dde-9e81-aba03af02256", // ← replace with real Polar product ID
    monthlyCredits: 250,
  },
} as const

export type PlanId = keyof typeof PLANS

// reverse lookup — Polar product ID → plan ID
export function getPlanByProductId(polarProductId: string): PlanId | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.polarProductId === polarProductId) return planId as PlanId
  }
  return null
}

export function getMonthlyCredits(planId: PlanId): number {
  return PLANS[planId].monthlyCredits
}

// ─────────────────────────────────────────────
// CREDIT COSTS
// Flat 10 credits per generation — voice call or chat session
// ─────────────────────────────────────────────

export const CREDIT_COST_PER_SESSION = 10