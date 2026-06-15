"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useCreditsBalance, useSpendCredits } from "@/modules/credits/hooks/use-credits"

// ─────────────────────────────────────────────
// HOOK
// AI SDK v5+ — useChat no longer manages input state
// or has handleSubmit/handleInputChange. We manage
// input locally and use sendMessage instead.
//
// Credits: 10 credits deducted on the FIRST message of
// each chat session. Subsequent messages in the same
// session are free (one session = one conversation).
// ─────────────────────────────────────────────

export function useInterviewChat(agentId: string) {
  const [input, setInput] = useState("")
  // Track whether credits have been spent for this session
  const creditSpent = useRef(false)

  const { data: credits } = useCreditsBalance()
  const { mutateAsync: spendCredits } = useSpendCredits()

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { agentId },
    }),
  })

  const isLoading = status === "submitted" || status === "streaming"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // ─────────────────────────────────────────
    // Deduct 10 credits on the first message only.
    // If insufficient, block and show upgrade toast.
    // ─────────────────────────────────────────
    if (!creditSpent.current) {
      if ((credits?.balance ?? 0) < 10) {
        toast.error("You need 10 credits to start a chat session", {
          action: {
            label: "Upgrade plan",
            onClick: () => (window.location.href = "/billing"),
          },
        })
        return
      }

      try {
        await spendCredits()
        creditSpent.current = true
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : ""
        if (msg === "INSUFFICIENT_CREDITS") {
          toast.error("Not enough credits. Upgrade your plan to continue.", {
            action: {
              label: "Upgrade plan",
              onClick: () => (window.location.href = "/billing"),
            },
          })
        } else {
          toast.error("Failed to deduct credits. Please try again.")
        }
        return
      }
    }

    sendMessage({ text: input })
    setInput("")
  }

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
  }
}