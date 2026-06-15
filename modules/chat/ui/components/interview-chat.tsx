"use client"

import { useEffect, useRef } from "react"
import { Send, Bot, User, MessageSquare } from "lucide-react"
import { useInterviewChat } from "../../hooks/use-interview-chat"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

// ─────────────────────────────────────────────
// CHAT UI
// ─────────────────────────────────────────────

interface InterviewChatProps {
  agentId: string
  agentName: string
  agentAvatarUrl?: string | null
}

export function InterviewChat({ agentId, agentName, agentAvatarUrl }: InterviewChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useInterviewChat(agentId)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const agentInitials = agentName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Card className="flex flex-col h-150 overflow-hidden p-0">
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b">
        <Avatar className="h-9 w-9 border border-primary/20 bg-primary/10">
          <AvatarImage src={agentAvatarUrl ?? undefined} alt={agentName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {agentInitials || <Bot size={16} />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{agentName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLoading ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
              }`}
            />
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Thinking..." : "Interview in progress"}
            </p>
          </div>
        </div>
      </div>

      {/* messages */}
      <ScrollArea className="flex-1 min-h-0 px-5">
        <div className="flex flex-col gap-5 py-5">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
              <div className="rounded-full bg-muted p-3">
                <MessageSquare size={20} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready when you are</p>
                <p className="text-xs text-muted-foreground max-w-60">
                  Send a message to begin the interview
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              role={message.role}
              parts={message.parts}
              agentInitials={agentInitials}
              agentAvatarUrl={agentAvatarUrl}
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <ChatBubble
              role="assistant"
              parts={[]}
              isTyping
              agentInitials={agentInitials}
              agentAvatarUrl={agentAvatarUrl}
            />
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t bg-card"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your answer..."
          disabled={isLoading}
          autoComplete="off"
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          {isLoading ? <Spinner className="size-4" /> : <Send size={16} />}
        </Button>
      </form>
    </Card>
  )
}

// ─────────────────────────────────────────────
// CHAT BUBBLE
// AI SDK v5+ messages have `parts` array instead of `content`.
// ─────────────────────────────────────────────

interface MessagePart {
  type: string
  text?: string
}

function ChatBubble({
  role,
  parts,
  isTyping,
  agentInitials,
  agentAvatarUrl,
}: {
  role: "user" | "assistant" | "system"
  parts: MessagePart[]
  isTyping?: boolean
  agentInitials: string
  agentAvatarUrl?: string | null
}) {
  const isUser = role === "user"

  const content = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("")

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        {isUser ? (
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User size={12} />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src={agentAvatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {agentInitials || <Bot size={12} />}
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-muted text-foreground"
            : "bg-primary/5 border border-primary/10 text-foreground"
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-2 py-0.5">
            <Spinner className="size-3.5" />
            <span className="text-xs text-muted-foreground">Thinking</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  )
}