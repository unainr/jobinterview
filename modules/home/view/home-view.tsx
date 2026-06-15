import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateAgentSheet } from "@/modules/agents/ui/components/create-agent-sheet";

export const HomeView = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-primary/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

      <div className="z-10 max-w-3xl flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6">
          Level Up Your <span className="text-primary">Interview Skills</span> with AI
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          Create specialized AI agents tailored to your role, experience level, and skills. Practice interviews, get real-time feedback, and land your dream job.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <CreateAgentSheet />
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto px-8 h-10 shadow-sm transition-all hover:bg-accent hover:text-accent-foreground">
            <Link href="/interview">
              View Agents
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
