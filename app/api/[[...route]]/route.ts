
import agents from "@/modules/agents/server/agents";
import sessions from "@/modules/sessions/server/sessions";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import chat from "@/modules/chat/server/chat";
const app = new Hono().basePath("/api");

const routes = app.route("/agents", agents).route("/sessions",sessions).route("/chat", chat);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
