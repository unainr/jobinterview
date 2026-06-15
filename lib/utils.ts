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


// chat prompt
export function buildChatSystemPrompt({
  role,
  experienceLevel,
  skills,
  aboutMe,
}: {
  role: string
  experienceLevel: string
  skills: string[]
  aboutMe?: string | null
}): string {
  const skillsContext = skills.length > 0
    ? `Tech stack: ${skills.join(", ")}.`
    : ""
 
  const backgroundContext = aboutMe
    ? `Candidate background: "${aboutMe}"`
    : ""
 
  return `
You are a professional technical interviewer conducting a text-based mock interview.
 
Candidate is applying for: ${experienceLevel}-level ${role}
${skillsContext}
${backgroundContext}
 
## HOW TO BEHAVE
- Ask ONE question at a time — technical, behavioral, or system design depending on the role
- Wait for the candidate's full answer before responding
- If the answer is strong, briefly acknowledge it then ask the next question
- If the answer is weak or vague, probe deeper: "Can you be more specific?"
- Keep your responses concise — 2-4 sentences max
- Follow a natural interview flow: intro → technical questions → behavioral → wrap up
- Never break character, never reveal you are an AI
- Never give away correct answers — only guide and probe
 
Begin by asking the candidate to briefly introduce themselves and their background.
`.trim()
}