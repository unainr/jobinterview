"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"

// ─────────────────────────────────────────────
// HOOK
// AI SDK v5+ — useChat no longer manages input state
// or has handleSubmit/handleInputChange. We manage
// input locally and use sendMessage instead.
// ─────────────────────────────────────────────

export function useInterviewChat(agentId: string) {
  const [input, setInput] = useState("")

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

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