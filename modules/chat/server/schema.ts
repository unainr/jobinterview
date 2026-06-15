import {z} from "zod";

export const chatSchema = z.object({
  agentId: z.string(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      parts: z.array(z.any()),
    }),
  ),
})