import { db } from "@/drizzle/db";
import { agents } from "@/drizzle/schema";
import { generateSlug } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { clerkMiddleware, getAuth } from "@clerk/hono";
import { createMiddleware } from "hono/factory";
import { eq, and } from "drizzle-orm";
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
		"/:slug",
		zValidator("param", z.object({ slug: z.string() })),
		requireAuth,
		async (c) => {
			const userId = c.get("userId");
			const { slug } = await c.req.valid("param");
			const [store] = await db
				.select()
				.from(agents)
				.where(and(eq(agents.slug, slug), eq(agents.userId, userId)));
			if (!store) return c.json({ message: "Agent not found" }, 404);
			return c.json(store);
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
