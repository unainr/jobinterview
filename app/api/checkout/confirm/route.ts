import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { userCredits, creditTransactions } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { getPlanByProductId, getMonthlyCredits, PLANS } from "@/lib/plan-config"

// ─────────────────────────────────────────────
// CHECKOUT CONFIRM
// GET /api/checkout/confirm?checkoutId=xxx
//
// Called from the billing page after Polar redirects back
// with ?success=true&checkoutId=xxx.
//
// We fetch the checkout from Polar to verify it's paid,
// then grant the correct credits to the user — no webhook needed.
// ─────────────────────────────────────────────

const POLAR_API_BASE = "https://sandbox-api.polar.sh/v1"

interface PolarCheckout {
  id: string
  status: string
  product_id: string | null
  external_customer_id: string | null
  subscription_id: string | null
}

async function getPolarCheckout(checkoutId: string): Promise<PolarCheckout> {
  const res = await fetch(`${POLAR_API_BASE}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Polar API error: ${res.status}`)
  }

  return res.json()
}

export const GET = async (req: NextRequest) => {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const checkoutId = new URL(req.url).searchParams.get("checkoutId")

  if (!checkoutId) {
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 })
  }

  // Fetch the checkout from Polar to verify payment status
  let checkout: PolarCheckout
  try {
    checkout = await getPolarCheckout(checkoutId)
  } catch (err) {
    console.error("[checkout/confirm] Failed to fetch checkout:", err)
    return NextResponse.json({ error: "Failed to fetch checkout from Polar" }, { status: 500 })
  }

  // Only process confirmed or succeeded checkouts
  if (checkout.status !== "confirmed" && checkout.status !== "succeeded") {
    return NextResponse.json(
      { error: "Checkout not completed yet", status: checkout.status },
      { status: 400 }
    )
  }

  // Verify checkout belongs to this user
  if (checkout.external_customer_id !== userId) {
    return NextResponse.json({ error: "Checkout does not belong to this user" }, { status: 403 })
  }

  const productId = checkout.product_id
  if (!productId) {
    return NextResponse.json({ error: "No product on checkout" }, { status: 400 })
  }

  const planId = getPlanByProductId(productId)
  if (!planId) {
    console.error("[checkout/confirm] Unknown product ID:", productId)
    return NextResponse.json({ error: "Unknown plan for this product" }, { status: 400 })
  }

  const monthlyCredits = getMonthlyCredits(planId)
  const subscriptionId = checkout.subscription_id ?? null

  // Idempotency: if user already on this plan with same subscriptionId, skip re-grant
  const [existing] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))

  if (existing?.polarSubscriptionId === subscriptionId && existing?.plan === planId) {
    return NextResponse.json({
      success: true,
      alreadyProcessed: true,
      data: { balance: existing.balance, plan: existing.plan },
    })
  }

  // Upsert user_credits: set plan + reset balance to plan's monthly credits
  const [updated] = await db
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
        balance: monthlyCredits,
        polarSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      },
    })
    .returning()

  // Log the credit grant
  await db.insert(creditTransactions).values({
    userId,
    type: "monthly_grant",
    amount: monthlyCredits,
    description: `Subscribed to ${PLANS[planId].label} — ${monthlyCredits} credits granted`,
  })

  console.log(`[checkout/confirm] ${userId} → ${planId}, ${monthlyCredits} credits`)

  return NextResponse.json({
    success: true,
    data: { balance: updated.balance, plan: updated.plan },
  })
}
