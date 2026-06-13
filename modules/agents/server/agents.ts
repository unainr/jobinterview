import { db } from "@/drizzle/db";
import { agents } from "@/drizzle/schema";
import { generateSlug } from "@/lib/utils";
import { clerkMiddleware, getAuth } from "@clerk/hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { AgentSchema } from "./schema";

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
	// Get api
	.get("/", requireAuth, async (c) => {
		const userId = c.get("userId");
		const result = await db
			.select()
			.from(agents)
			.where(eq(agents.userId, userId));
		return c.json(result);
	})
	.get(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		requireAuth,
		async (c) => {
			const userId = c.get("userId");
			const { id } = await c.req.valid("param");
			
			const [agent] = await db
				.select()
				.from(agents)
				.where(and(eq(agents.id, id), eq(agents.userId, userId)));
			if (!agent) return c.json({ message: "Agent not found" }, 404);
			return c.json(agent );
		},
	)
	// post api
	.post("/", requireAuth, zValidator("json", AgentSchema), async (c) => {
		const userId = c.get("userId");
		const { name, role, experienceLevel, aboutMe, skills, avatarUrl } =
			await c.req.valid("json");
		const slug = generateSlug(name);
		const [data] = await db
			.insert(agents)
			.values({
				userId,
				name,
				slug,
				role,
				experienceLevel,
				aboutMe,
				skills,
				avatarUrl,
			})
			.returning();
		return c.json(data, 201);
	});

export default app;
