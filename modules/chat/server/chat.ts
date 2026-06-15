import { db } from "@/drizzle/db";
import {  agents } from "@/drizzle/schema";
import { buildChatSystemPrompt } from "@/lib/utils";
import { clerkMiddleware, getAuth } from "@clerk/hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { chatSchema } from "./schema";
import { streamText, convertToModelMessages, type UIMessage } from "ai"

import { groq } from "@ai-sdk/groq";
// schame

// ─── auth middleware ──────────────────────────────────────────────────────────

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

	// post api
	.post("/", requireAuth, zValidator("json", chatSchema), async (c) => {
		const userId = c.get("userId");
		const { agentId, messages } = c.req.valid("json");
		// verify session ownership + get agent
		
		const [agent] = await db
			.select()
			.from(agents)
			.where(and(
                eq(agents.id, agentId),
                eq(agents.userId, userId)
            ));

		if (!agent) return c.json({ error: "Agent not found" }, 404);

		const systemPrompt = buildChatSystemPrompt({
			role: agent.role,
			experienceLevel: agent.experienceLevel,
			skills: agent.skills ?? [],
			aboutMe: agent.aboutMe,
		});

		const result = streamText({
			model: groq("openai/gpt-oss-20b"),
			system: systemPrompt,
		 messages: await convertToModelMessages(messages as UIMessage[]),

			maxOutputTokens: 2000,
		});

return result.toUIMessageStreamResponse()
	});

export default app;
