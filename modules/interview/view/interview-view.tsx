"use client";

import { CreateAgentSheet } from "@/modules/agents/ui/components/create-agent-sheet";
import AgentCard from "@/modules/agents/ui/components/agent-card";

export const InterviewView = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 my-15">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Interview Agents</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Select an agent to start an interview or create a new one tailored to your needs.
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            <CreateAgentSheet />
          </div>
        </div>

        {/* The AgentCard component handles its own grid or list rendering */}
        <AgentCard />
      </div>
    </div>
  );
};
