// modules/calls/ui/components/generate-feedback-button.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCreateFeedBack } from "@/modules/sessions/hooks/use-create-feedback"

type Props = {
  sessionId:     string
  vapiCallId: string
}

export function GenerateFeedbackButton({ sessionId, vapiCallId }: Props) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
const {mutate: generateFeedback,isPending}= useCreateFeedBack()
  const handleGenerate = () => {
    setLoading(true)
    setError("")

    generateFeedback({ sessionId ,vapiCallId})

    // Reload the page — server component will now see status=completed
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        variant={"primary"}
       
      >
        {loading ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Analysing your call…
          </>
        ) : (
          <>
            <SparklesIcon className="size-4" />
            Generate Feedback
          </>
        )}
      </Button>

      {error && (
        <p className="text-[13px] text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}