import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
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