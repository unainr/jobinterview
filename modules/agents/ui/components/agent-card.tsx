"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useAgent } from "../../hooks/use-agent";
import { AgentCardSkeleton } from "./agent-card-skeleton";
import Image from "next/image"

const EXPERIENCE_COLORS = {
	junior: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	mid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	senior: "bg-violet-500/10 text-violet-400 border-violet-500/20",
	lead: "bg-amber-500/10 text-amber-400 border-amber-500/20",
} as const;

const EXPERIENCE_LABELS = {
	junior: "Junior (0–2 years)",
	mid: "Mid (2–5 years)",
	senior: "Senior (5–8 years)",
	lead: "Lead (8+ years)",
} as const;

export default function AgentCard() {
	const { data: agent, isLoading, isError } = useAgent();

	{isLoading && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
            <AgentCardSkeleton key={i} />
        ))}
    </div>
)}

	if (isError || !agent) {
		return (
			<div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
				<p className="text-zinc-300 text-sm font-medium">Agent not found</p>
				<p className="text-zinc-600 text-xs mt-1 mb-6">
					This agent doesn't exist or you don't have access.
				</p>
				<Button asChild size="sm" variant="outline">
					<Link href="/agents">Back to agents</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            {
                agent.map((agent) => (
                    	<div key={agent.id} className="max-w-2xl mx-auto px-4 py-12">
				{/* Back */}
				<Link
					href="/agent"
					className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
					All agents
				</Link>

				{/* Banner */}
				{agent.avatarUrl && (
					<div className="w-full h-40 rounded-2xl overflow-hidden border border-zinc-800 mb-6">
						<Image width={900} height={900}
							src={agent.avatarUrl}
							alt={agent.name}
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				{/* Header */}
				<div className="flex items-start gap-4 mb-8">
					{agent.avatarUrl ? (
						<Image width={800} height={800}
							src={agent.avatarUrl}
							alt={agent.name}
							className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0 -mt-8 ml-4 ring-4 ring-zinc-950"
						/>
					) : (
						<div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
							<HugeiconsIcon icon={UserIcon} size={24} strokeWidth={1.5} className="text-zinc-500" />
						</div>
					)}
					<div className="min-w-0 pt-1">
						<h1 className="text-xl font-semibold tracking-tight truncate">
							{agent.name}
						</h1>
						<p className="text-sm text-zinc-500 mt-0.5">{agent.role}</p>
					</div>
				</div>

				{/* Details card */}
				<div className="rounded-2xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
					{/* Experience */}
					<div className="px-5 py-4 flex items-center justify-between">
						<span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
							Experience
						</span>
						<span
							className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
								EXPERIENCE_COLORS[agent.experienceLevel]
							}`}
						>
							{EXPERIENCE_LABELS[agent.experienceLevel]}
						</span>
					</div>

					{/* Skills */}
					{agent.skills && agent.skills.length > 0 && (
						<div className="px-5 py-4">
							<span className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-3">
								Skills
							</span>
							<div className="flex flex-wrap gap-2">
								{agent.skills.map((skill) => (
									<span
										key={skill}
										className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800 border border-zinc-700 text-zinc-300"
									>
										{skill}
									</span>
								))}
							</div>
						</div>
					)}

					{/* About */}
					{agent.aboutMe && (
						<div className="px-5 py-4">
							<span className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-2">
								About
							</span>
							<p className="text-sm text-zinc-400 leading-relaxed">
								{agent.aboutMe}
							</p>
						</div>
					)}
				</div>

				{/* Start interview CTA */}
				<div className="mt-6">
               <Link href={`/agent/${agent.id}`}>
					<Button className="w-full" size="lg">
						Start Interview
					</Button>
                </Link>
				</div>
			</div>
                ))
            }
		
		</div>
	);
}