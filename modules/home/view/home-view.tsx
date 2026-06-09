import { CreateAgentForm } from "@/modules/agents/ui/components/create-agents-form"

export const HomeView = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-15">
      <CreateAgentForm/>
    </div>
  )
}
