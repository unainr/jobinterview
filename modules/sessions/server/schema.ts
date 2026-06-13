import z from "zod"

export const createSessionSchema = z.object({
  agentId:         z.string().uuid(),
    vapiCallId: z.string().optional(), // ✅ add this

  isPublicSession: z.boolean().optional().default(false),
})
 
export const updateSessionSchema = z.object({
  sessionId:z.string(),
 
})

export const vapiSchema = z.object({
 vapiCallId: z.string().min(1),

})

export const generateFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
    vapiCallId: z.string().optional(), // ✅ add this

})