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
	detail: (slug: string) => ["agents", slug] as const,
};