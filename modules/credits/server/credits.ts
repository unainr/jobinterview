import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { clerkMiddleware, getAuth } from "@clerk/hono"
import { createMiddleware } from "hono/factory"
import { eq, desc, sql, and } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/drizzle/db"
import { userCredits, creditTransactions } from "@/drizzle/schema"
import { CREDIT_COST_PER_SESSION } from "@/lib/plan-config"

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const spendCreditsSchema = z.object({
  relatedSessionId: z.string().uuid().optional(),
})

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────

const requireAuth = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401)
  c.set("userId", auth.userId)
  await next()
})

// ─────────────────────────────────────────────
// ROUTE
// ─────────────────────────────────────────────

const app = new Hono()
  .use(
    "*",
    clerkMiddleware({
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey:      process.env.CLERK_SECRET_KEY,
    }),
  )

  // GET /credits/balance
  // Returns balance + plan — creates row with free plan defaults if none exists
  .get("/balance", requireAuth, async (c) => {
    const userId = c.get("userId")

    const [credits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))

    if (!credits) {
      const [created] = await db
        .insert(userCredits)
        .values({ userId }) // defaults: plan=free, balance=20
        .returning()

      return c.json({
        success: true,
        data: { balance: created.balance, plan: created.plan },
      })
    }

    return c.json({
      success: true,
      data: { balance: credits.balance, plan: credits.plan },
    })
  })

  // POST /credits/spend
  // Deducts a flat 10 credits for one chat session or voice call.
  //
  // Atomic conditional update — balance check + deduction happen
  // in one SQL statement, preventing race conditions where two
  // requests both pass the check before either deducts.
  .post("/spend", requireAuth, zValidator("json", spendCreditsSchema), async (c) => {
    const userId = c.get("userId")
    const {  relatedSessionId } = c.req.valid("json")

    const cost = CREDIT_COST_PER_SESSION

    const [updated] = await db
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} - ${cost}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userCredits.userId, userId),
          sql`${userCredits.balance} >= ${cost}`,
        ),
      )
      .returning()

    if (!updated) {
      return c.json({ error: "Insufficient credits", required: cost }, 402)
    }

    await db.insert(creditTransactions).values({
      userId,
      type: "usage",
      amount: -cost,
      relatedSessionId: relatedSessionId ?? null,
    })

    return c.json({ success: true, data: { balance: updated.balance, spent: cost } })
  })

  // GET /credits/transactions
  .get("/transactions", requireAuth, async (c) => {
    const userId = c.get("userId")

    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50)

    return c.json({ success: true, data: transactions })
  })

export default app