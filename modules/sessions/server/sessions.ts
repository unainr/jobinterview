import { db } from "@/drizzle/db";
import { agents, sessions } from "@/drizzle/schema";
import { clerkMiddleware, getAuth } from "@clerk/hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { createSessionSchema, generateFeedbackSchema, updateSessionSchema, vapiSchema } from "./schema";
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

import { buildFeedbackPrompt } from "@/lib/utils";

const requireAuth = createMiddleware<{
	Variables: { userId: string };
}>(async (c, next) => {
	const auth = getAuth(c);
	if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);
	c.set("userId", auth.userId);
	await next();
});

const app = new Hono()
	.use(
		"*",
		clerkMiddleware({
			publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
			secretKey: process.env.CLERK_SECRET_KEY,
		}),
	)
	.get("/", requireAuth, async (c) => {
		const userId = c.get("userId");

		const userSessions = await db
  .select({
    // session fields
    id:              sessions.id,
    status:          sessions.status,
    feedback:        sessions.feedback,
    recordingUrl:    sessions.recordingUrl,
    isPublicSession: sessions.isPublicSession,
    vapiCallId:      sessions.vapiCallId,
    transcript:      sessions.transcript,
    startedAt:       sessions.startedAt,
    endedAt:         sessions.endedAt,
    createdAt:       sessions.createdAt,
    // agent fields
    agentId:         agents.id,
    agentName:       agents.name,
    agentRole:       agents.role,
    agentSlug:       agents.slug,
    agentAvatarUrl:  agents.avatarUrl,
    agentSkills:     agents.skills,
    agentExperienceLevel: agents.experienceLevel
  })
  .from(sessions)
  .leftJoin(agents, eq(sessions.agentId, agents.id))
  .where(eq(sessions.userId, userId))
  .orderBy(desc(sessions.createdAt))

		return c.json(userSessions);
	})

	// Single session — only if it belongs to current user

	.post(
		"/",
		requireAuth,
		zValidator("json", createSessionSchema),
		async (c) => {
			const userId = c.get("userId");
			const { agentId, isPublicSession,vapiCallId } = c.req.valid("json");

			const [newSession] = await db
				.insert(sessions)
				.values({
					userId,
					agentId,
					isPublicSession,
					vapiCallId,
					status: "active",
				})
				.returning();

			return c.json({ success: true, data: newSession }, 201);
		},
	)
	.patch(
		"/:id/vapi-call-id",
		requireAuth,
		zValidator("param", updateSessionSchema),
		zValidator("json",vapiSchema,),

		async (c) => {
			const userId = c.get("userId");
			const { sessionId } = c.req.valid("param");
			const { vapiCallId } = await c.req.valid("json");

			const [result] = await db
				.update(sessions)
				.set({ vapiCallId, status: "active" , startedAt: new Date()})
				.where(and(eq(sessions.agentId, sessionId), eq(sessions.userId, userId))).returning()
				return c.json({result},200)
		},
	)
	.post("/feedback",requireAuth, zValidator("json",generateFeedbackSchema), async (c) => {
		const userId = c.get("userId")
		const { sessionId , vapiCallId} = c.req.valid("json")

		const [session] = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.id, sessionId),
            eq(sessions.userId, userId),
          ),
        )
 
      if (!session) return c.json({ error: "Session not found" }, 404)
      if (!session.vapiCallId) return c.json({ error: "No Vapi call ID found. Did the call start?" }, 400)
 
      // step 2 — fetch call data from Vapi
      const vapiRes = await fetch(
        `https://api.vapi.ai/call/${session.vapiCallId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
          },
        },
      )
 
      if (!vapiRes.ok) {
        console.error("[feedback] Vapi API error:", vapiRes.status)
        return c.json({ error: "Could not fetch call data. Try again in a moment." }, 500)
      }
 
      const vapiCall = await vapiRes.json()
 
      // step 3 — extract transcript
      // Vapi returns messages with role "bot" not "assistant"
      const messages = vapiCall?.messages ?? []
      const transcript = messages
        .filter((m: any) => m.role === "user" || m.role === "bot")
        .map((m: any) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.message ?? ""}`)
        .join("\n")
        .trim()
 
      // fall back to top-level transcript string if messages are empty
      const finalTranscript = transcript || vapiCall?.transcript || ""
 
      if (!finalTranscript) {
        return c.json({
          error: "Transcript not ready yet. Wait a few seconds and try again.",
        }, 400)
      }
 
      // extract recording URL and timing
      const recordingUrl = vapiCall?.artifact?.recordingUrl ?? vapiCall?.recordingUrl ?? null
      const startedAt    = vapiCall?.startedAt ?? null
      const endedAt      = vapiCall?.endedAt   ?? null
 
      // step 4 — get agent + skills for context
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, session.agentId))
 
      if (!agent) return c.json({ error: "Agent not found" }, 404)
 
      const skills = agent.skills ?? []
 
      // step 5 — generate AI feedback
      const { text } = await generateText({
        model:     groq("openai/gpt-oss-120b"),
        maxOutputTokens: 2000,
        prompt:    buildFeedbackPrompt({
          role:            agent.role,
          experienceLevel: agent.experienceLevel,
          skills,
          transcript:      finalTranscript,
        }),
      })
 
      // parse feedback — Groq returns raw JSON string
      let feedback: Record<string, unknown> = {}
      try {
        const cleaned = text.replace(/```json|```/g, "").trim()
        feedback = JSON.parse(cleaned)
      } catch {
        console.error("[feedback] Failed to parse AI response:", text)
        return c.json({ error: "Failed to parse feedback. Try again." }, 500)
      }
 
      // step 6 — save everything to session row
      const [updated] = await db
        .update(sessions)
        .set({
          transcript:   finalTranscript,
          recordingUrl: recordingUrl ?? null,
          feedback:     JSON.stringify(feedback),
          status:       "completed",
          endedAt:      endedAt ? new Date(endedAt) : new Date(),
        })
        .where(eq(sessions.id, sessionId))
        .returning()
 
      return c.json({ success: true, data: updated })
    
	})
.get("/:sessionId/recording", requireAuth, async (c) => {
  const userId = c.get("userId")
  const sessionId = c.req.param("sessionId")

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))

  if (!session) return c.json({ error: "Session not found" }, 404)
  if (!session.vapiCallId) return c.json({ error: "No recording for this session" }, 404)

  const vapiRes = await fetch(
    `https://api.vapi.ai/call/${session.vapiCallId}/mono-recording`,
    {
      headers: { Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}` },
      redirect: "manual", // don't download the audio body — just read the redirect target
    },
  )

  if (vapiRes.status >= 300 && vapiRes.status < 400) {
    const signedUrl = vapiRes.headers.get("location")
    if (!signedUrl) {
      console.error("[recording] 3xx response with no Location header")
      return c.json({ error: "Recording not available" }, 502)
    }
    return c.json({ url: signedUrl })
  }

  console.error("[recording] Unexpected Vapi response:", vapiRes.status)
  return c.json({ error: "Recording not available" }, 502)
})
export default app;
