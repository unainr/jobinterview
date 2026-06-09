import {z} from "zod";
export const AgentSchema = z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
    aboutMe: z.string().optional(),
    skills: z.array(z.string()).optional(),
    avatarUrl: z.string().optional(),
})