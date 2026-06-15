import { Webhooks } from "@polar-sh/nextjs"
import { db } from "@/drizzle/db"
import { userCredits, creditTransactions, processedWebhookEvents } from "@/drizzle/schema"
import { eq, sql } from "drizzle-orm"
import { getMonthlyCredits, getPlanByProductId, PLANS } from "@/lib/plan-config"

// ─────────────────────────────────────────────
// WEBHOOK
// /api/webhooks/polar
//
// Handles:
// - order.created (billing_reason: subscription_create | subscription_cycle)
//   → grants monthly credits, sets/updates plan
// - subscription.revoked / subscription.canceled
//   → downgrades to free plan
//
// IDEMPOTENCY: every Polar event has a unique `id`.
// We record processed event IDs in processedWebhookEvents
// and skip if we've seen this event before.
// ─────────────────────────────────────────────

async function isAlreadyProcessed(eventId: string, eventType: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(processedWebhookEvents)
    .where(eq(processedWebhookEvents.polarEventId, eventId))

  if (existing) return true

  await db.insert(processedWebhookEvents).values({
    polarEventId: eventId,
    eventType,
  })

  return false
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // ─────────────────────────────────────────
  // ORDER CREATED — handles both initial subscription
  // purchase and monthly renewals
  // ─────────────────────────────────────────
  onOrderCreated: async (payload) => {
    const order = payload.data
    const eventId = order.id

    if (await isAlreadyProcessed(eventId, "order.created")) return

    const userId = order.customer?.externalId
    const polarProductId = order.productId as string // Polar product ID
    const billingReason = order.billingReason // "subscription_create" | "subscription_cycle" | ...

    if (!userId) {
      console.error("[polar webhook] Missing customerExternalId on order:", order.id)
      return
    }

    // only grant credits for subscription renewals. 
    // Initial creation (subscription_create) is already handled instantly via the /api/checkout/confirm redirect
    if (billingReason !== "subscription_cycle") {
      return
    }

    const planId = getPlanByProductId(polarProductId)

    if (!planId) {
      console.error("[polar webhook] Unknown product ID:", polarProductId)
      return
    }

    const monthlyCredits = getMonthlyCredits(planId)
    const subscriptionId = order.subscriptionId ?? null

    // upsert user_credits row:
    // - subscription_create → set plan, top up to monthly amount
    // - subscription_cycle (renewal) → reset balance to monthly amount, keep plan
    await db
      .insert(userCredits)
      .values({
        userId,
        plan: planId,
        balance: monthlyCredits,
        polarSubscriptionId: subscriptionId,
      })
      .onConflictDoUpdate({
        target: userCredits.userId,
        set: {
          plan: planId,
          balance: monthlyCredits, // reset to plan's monthly amount on each cycle
          polarSubscriptionId: subscriptionId,
          updatedAt: new Date(),
        },
      })

    // log transaction
    await db.insert(creditTransactions).values({
      userId,
      type: "monthly_grant",
      amount: monthlyCredits,
      description: `Monthly renewal — ${PLANS[planId].label} plan, ${monthlyCredits} credits reset`,
    })

    console.log(`[polar webhook] ${userId} → ${planId} plan, ${monthlyCredits} credits`)
  },

  // ─────────────────────────────────────────
  // SUBSCRIPTION REVOKED — final cancellation,
  // downgrade to free plan
  // ─────────────────────────────────────────
  onSubscriptionRevoked: async (payload) => {
    const subscription = payload.data
    const eventId = subscription.id

    if (await isAlreadyProcessed(eventId, "subscription.revoked")) return

    const userId = subscription.customer?.externalId
    if (!userId) return

    const freeCredits = getMonthlyCredits("free")

    await db
      .update(userCredits)
      .set({
        plan: "free",
        balance: freeCredits,
        polarSubscriptionId: null,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))

    await db.insert(creditTransactions).values({
      userId,
      type: "monthly_grant",
      amount: freeCredits,
      description: "Subscription ended — downgraded to Free plan",
    })

    console.log(`[polar webhook] ${userId} → downgraded to free plan`)
  },
})