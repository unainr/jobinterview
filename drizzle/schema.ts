import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core"

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const experienceLevelEnum = pgEnum("experience_level", [
  "junior",
  "mid",
  "senior",
  "lead",
])

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
  "abandoned",
])

// ─────────────────────────────────────────────
// AGENTS
// One agent = one interview persona.
// Skills stored as simple array — no separate table.
// System prompt generated on the fly at session start.
// ─────────────────────────────────────────────

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),        // /u/[slug] public URL
  avatarUrl: text("avatar_url"),

  role: text("role").notNull(),                 // "Frontend Developer"
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  aboutMe: text("about_me"),                    // "3 yrs React, built X at Y"
  skills: text("skills").array().notNull().default([]), // ["React", "TypeScript"]

  isPublic: boolean("is_public").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// SESSIONS
// One row per Vapi call.
// Vapi stores the transcript + recording.
// We store vapiCallId to fetch them from Vapi API.
// After call ends — pass transcript to AI → get feedback.
// ─────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),                     // null = public page session
  agentId: uuid("agent_id").notNull().references(() => agents.id, {
    onDelete: "cascade",
  }),

  vapiCallId: text("vapi_call_id"),            // Vapi call ID → fetch transcript + recording URL
  recordingUrl: text("recording_url"),         // fetched from Vapi after call ends
  transcript: text("transcript"),              // fetched from Vapi after call ends
  feedback: text("feedback"),                  // AI-generated from transcript

  status: sessionStatusEnum("status").default("active").notNull(),
  isPublicSession: boolean("is_public_session").default(false).notNull(),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type Agent = typeof agents.$inferSelect
export type NewAgent = typeof agents.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert


// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
 
export const planEnum = pgEnum("plan", ["free", "pro", "premium"])
 
export const creditTransactionTypeEnum = pgEnum("credit_transaction_type", [
  "monthly_grant",  // credits granted on subscription renewal/start
  "usage",          // credits spent on a session (chat or voice)
])
 
// ─────────────────────────────────────────────
// USER PLAN + CREDITS
// One row per user.
// - plan: current subscription tier
// - balance: current credit balance (resets/tops-up on renewal)
// - polarSubscriptionId: used to verify webhook events belong to this user
// ─────────────────────────────────────────────
 
export const userCredits = pgTable("user_credits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
 
  plan: planEnum("plan").default("free").notNull(),
  balance: integer("balance").default(20).notNull(), // starts with free plan's 20
 
  polarSubscriptionId: text("polar_subscription_id"), // null for free plan
 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
 
// ─────────────────────────────────────────────
// CREDIT TRANSACTIONS
// Audit log for balance changes
// ─────────────────────────────────────────────
 
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
 
  type: creditTransactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // positive for grant, negative for usage
 
  relatedSessionId: uuid("related_session_id"), // sessions.id if type = usage
  description: text("description"),
 
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
 
// ─────────────────────────────────────────────
// PROCESSED WEBHOOK EVENTS
// Idempotency — Polar may redeliver the same event.
// We record event IDs we've already processed.
// ─────────────────────────────────────────────
 
export const processedWebhookEvents = pgTable("processed_webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  polarEventId: text("polar_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
})
 
// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
 
export type UserCredits = typeof userCredits.$inferSelect
export type NewUserCredits = typeof userCredits.$inferInsert
 
export type CreditTransaction = typeof creditTransactions.$inferSelect
export type NewCreditTransaction = typeof creditTransactions.$inferInsert
