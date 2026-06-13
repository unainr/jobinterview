import AgentCard from "@/modules/agents/ui/components/agent-card"
import { CreateAgentForm } from "@/modules/agents/ui/components/create-agents-form"

export const HomeView = () => {
  return (
    <div className="flex flex-row items-center justify-center min-h-screen py-15">
      {/* <CreateAgentForm/> */}
      <AgentCard/>
    </div>
  )
}
