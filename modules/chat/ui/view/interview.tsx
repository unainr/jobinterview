"use client";

import { useGetAgentId } from "@/modules/agents/hooks/use-get-agent-id";
import { InterviewChat } from "../components/interview-chat";

export default function InterviewPageView({agentId}: {agentId: string})  {
	const { data: agent } = useGetAgentId(agentId);
	
	if (!agent || !agentId) {
		 return null
	}

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<InterviewChat
				agentId={agentId}
				agentName={agent.name}
				agentAvatarUrl={agent.avatarUrl}
			/>
		</div>
	);
}
