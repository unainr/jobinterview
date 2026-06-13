import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const EXPERIENCE_LABELS: Record<string, string> = {
	junior: "Junior",
	mid: "Mid",
	senior: "Senior",
	lead: "Lead",
	
};


export function generateSlug(name: string): string {
  return name
	.toLowerCase()
	.trim()
	.replace(/[^a-z0-9\s-]/g, "")
	.replace(/\s+/g, "-")
	.replace(/-+/g, "-")
}


export const agentKeys = {
	all: ["agents"] as const,
	detail: (id: string) => ["agents", id] as const,
};


export function buildFeedbackPrompt({
  role,
  experienceLevel,
  skills,
  transcript,
}: {
  role: string
  experienceLevel: string
  skills: string[]
  transcript: string
}): string {
  return `
You are a senior technical interviewer reviewing a mock interview session.
 
Candidate Details:
- Role: ${role}
- Experience Level: ${experienceLevel}
- Skills: ${skills.join(", ")}
 
Interview Transcript:
${transcript}
 
Analyze the candidate's performance and return a structured JSON feedback object with exactly this shape:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "recommendation": "<hire | consider | no_hire>"
}
 
Return ONLY the JSON object. No markdown, no explanation.
`.trim()
}