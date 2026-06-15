'use client'

import { useGetAgentId } from "../hooks/use-get-agent-id"
import AgentUI from "./components/agent-ui"
import InterviewPageView from "@/modules/chat/ui/view/interview"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Chat01FreeIcons, Robot, AlertCircleIcon } from "@hugeicons/core-free-icons"

export const AgentView = ({ id, user }: { id: string; user: any | null }) => {
  const { data: agent, isLoading } = useGetAgentId(id)

  if (isLoading) return <AgentViewSkeleton />

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 text-center px-6">
        <div className="rounded-full bg-muted p-3">
          <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Agent not found</p>
          <p className="text-xs text-muted-foreground">
            This agent may have been deleted or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col px-4 py-20 overflow-hidden">
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 min-h-0 gap-4">

        {/* page header */}
        <div className="space-y-1 shrink-0">
          <h1 className="text-xl font-semibold tracking-tight">{agent.name}</h1>
          <p className="text-sm text-muted-foreground">
            {agent.role} · {agent.experienceLevel} level
          </p>
        </div>

        {/* mode tabs */}
        <Tabs defaultValue="chat" className="flex flex-col flex-1 min-h-0 gap-3">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="chat" className="gap-2">
              <HugeiconsIcon icon={Chat01FreeIcons} size={16} strokeWidth={2} />
              Chat
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-2">
              <HugeiconsIcon icon={Robot} size={16} strokeWidth={2} />
              Voice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 min-h-0">
            <InterviewPageView agentId={id} />
          </TabsContent>

          <TabsContent value="interview" className="flex-1 min-h-0">
            <AgentUI
              id={id}
              userName={user?.firstName}
              imageUrl={user?.imageUrl}
              config={agent}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────

function AgentViewSkeleton() {
  return (
    <div className="h-screen flex flex-col px-4 py-6 sm:py-10 overflow-hidden">
      <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 min-h-0 gap-4">
        <div className="space-y-2 shrink-0">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full shrink-0" />
        <Skeleton className="flex-1 w-full rounded-2xl" />
      </div>
    </div>
  )
}