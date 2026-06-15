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
			<div className="min-h-[50vh] bg-background flex flex-col items-center justify-center text-center px-4 rounded-xl border border-dashed border-border mt-8">
				<p className="text-foreground text-base font-semibold">Agent not found</p>
				<p className="text-muted-foreground text-sm mt-1 mb-6">
					This agent doesn't exist or you don't have access.
				</p>
				<Button asChild size="sm" variant="outline">
					<Link href="/agents">Back to agents</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {
                agent.map((agent) => (
                    <div key={agent.id} className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all">
						{/* Banner */}
						{agent.avatarUrl ? (
							<div className="w-full h-32 relative">
								<Image 
                                    fill
									src={agent.avatarUrl}
									alt={agent.name}
									className="object-cover"
								/>
							</div>
						) : (
							<div className="w-full h-32 bg-muted" />
						)}

						{/* Content */}
						<div className="flex flex-col flex-1 p-6 relative">
							{/* Avatar */}
							{agent.avatarUrl ? (
								<Image 
                                    width={48} 
                                    height={48}
									src={agent.avatarUrl}
									alt={agent.name}
									className="w-12 h-12 rounded-xl object-cover border border-border absolute -top-6 left-6 ring-4 ring-card bg-card"
								/>
							) : (
								<div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center absolute -top-6 left-6 ring-4 ring-card">
									<HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.5} className="text-muted-foreground" />
								</div>
							)}

							<div className="mt-4 flex-1">
								<h2 className="text-xl font-semibold tracking-tight text-card-foreground line-clamp-1">
									{agent.name}
								</h2>
								<p className="text-sm text-muted-foreground mt-1 line-clamp-1">{agent.role}</p>

								{/* Experience Badge */}
								<div className="mt-4">
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${
											EXPERIENCE_COLORS[agent.experienceLevel]
										}`}
									>
										{EXPERIENCE_LABELS[agent.experienceLevel]}
									</span>
								</div>

								{/* Skills */}
								{agent.skills && agent.skills.length > 0 && (
									<div className="flex flex-wrap gap-1.5 mt-4">
										{agent.skills.slice(0, 3).map((skill) => (
											<span
												key={skill}
												className="px-2 py-1 rounded-md text-xs bg-muted/50 border border-border/50 text-muted-foreground"
											>
												{skill}
											</span>
										))}
										{agent.skills.length > 3 && (
											<span className="px-2 py-1 rounded-md text-xs bg-muted/50 border border-border/50 text-muted-foreground/70">
												+{agent.skills.length - 3}
											</span>
										)}
									</div>
								)}
							</div>

							<div className="mt-6 pt-6 border-t border-border/50">
								<Button asChild className="w-full font-medium" variant="secondary">
                                    <Link href={`/agent/${agent.id}`}>
                                        Start Interview
                                    </Link>
								</Button>
							</div>
						</div>
					</div>
                ))
            }
		</div>
	);
}