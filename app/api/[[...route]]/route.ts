
import agents from "@/modules/agents/server/agents";
import sessions from "@/modules/sessions/server/sessions";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import chat from "@/modules/chat/server/chat";
import credits from "@/modules/credits/server/credits";
const app = new Hono().basePath("/api");

const routes = app.route("/agents", agents).route("/sessions",sessions).route("/chat", chat).route("/credits", credits);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
