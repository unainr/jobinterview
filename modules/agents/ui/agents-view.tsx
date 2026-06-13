'use client'

import { useGetAgentId } from "../hooks/use-get-agent-id";
import AgentUI from "./components/agent-ui";

export const AgentView = ({ id, user }: { id: string; user: any | null }) => {
    const { data: agent, isLoading } = useGetAgentId(id);

    if (isLoading) return <div>Loading...</div>;

    if (!agent) return <div>Agent not found</div>;  // ← this narrows the type

    return (
        <div className="min-h-screen p-3 py-20">
            <AgentUI
                id={id}
                userName={user?.firstName}
                imageUrl={user?.imageUrl}
                config={agent}  // ← now guaranteed to be InterviewAssistantConfig
            />
        </div>
    );
}