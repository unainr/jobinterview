"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, MessageSquare, Mic, Send } from "lucide-react"

// ─────────────────────────────────────────────
// HERO SECTION — v3
// Reference calibration: Raycast / Cal.com / Linear style —
// a real product window in a browser-style frame, not a
// floating decorative chat toy. The frame itself switches
// between Chat and Voice tabs, which is the actual product
// surface a user would see, just shown statically/looping
// for the marketing page.
// ─────────────────────────────────────────────

const DEMO_EXCHANGE = [
  {
    role: "agent" as const,
    text: "Tell me about a time you optimized a slow render path.",
  },
  {
    role: "user" as const,
    text: "I noticed a dashboard re-rendering on every keystroke — memoized the chart and debounced the input.",
  },
]

export function HeroSection() {
  return (
    <section className="relative bg-[#faf9f5] dark:bg-[#0a0a0a] overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-24 pb-20 lg:pt-32">

        {/* ── centered copy ── */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#161510]/10 dark:border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8d92e]" />
            <span className="text-[13px] text-[#161510]/60 dark:text-white/50 font-medium">
              Now supporting voice interviews
            </span>
          </div>

          <h1
            className="text-[2.75rem] sm:text-[3.75rem] leading-[1.05] tracking-[-0.02em] text-[#161510] dark:text-white mb-6"
            style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
          >
            Build an AI that<br />interviews you back
          </h1>

          <p className="text-[17px] leading-[1.65] text-[#161510]/55 dark:text-white/50 max-w-[480px] mx-auto mb-9">
            Teach an agent your background once. Practice real interviews
            by chat or voice, then share a link so it answers for you anywhere.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard/agents/new"
              className="group inline-flex items-center gap-2 bg-[#161510] dark:bg-white text-white dark:text-[#161510] text-[14px] font-medium px-6 py-3.5 rounded-full transition-transform hover:-translate-y-0.5"
            >
              Create your agent
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/u/demo"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-[#161510]/70 dark:text-white/70 hover:text-[#161510] dark:hover:text-white px-2 py-3.5 transition-colors"
            >
              Watch a live agent
            </Link>
          </div>
        </div>

        {/* ── product window ── */}
        <ProductWindow />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// PRODUCT WINDOW
// Browser-chrome frame containing the actual interview UI,
// with a real tab switcher for Chat / Voice.
// ─────────────────────────────────────────────

function ProductWindow() {
  const [mode, setMode] = useState<"chat" | "voice">("chat")

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-[#161510]/10 dark:border-white/10 bg-white dark:bg-[#111110] shadow-[0_40px_80px_-30px_rgba(22,21,16,0.25)] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] overflow-hidden">

        {/* window chrome */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#161510]/8 dark:border-white/8 bg-[#f4f2ec] dark:bg-[#161614]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#161510]/15 dark:bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#161510]/15 dark:bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#161510]/15 dark:bg-white/15" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[12px] font-mono text-[#161510]/40 dark:text-white/35">
              clario.ai/u/sarah
            </span>
          </div>
          <div className="w-12" />
        </div>

        {/* tab bar */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#161510]/8 dark:border-white/8">
          <TabButton active={mode === "chat"} onClick={() => setMode("chat")} icon={MessageSquare}>
            Chat
          </TabButton>
          <TabButton active={mode === "voice"} onClick={() => setMode("voice")} icon={Mic}>
            Voice
          </TabButton>
        </div>

        {/* body */}
        <div className="p-6 sm:p-8 min-h-[280px] flex flex-col">
          {mode === "chat" ? <ChatPanel /> : <VoicePanel />}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof MessageSquare
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[13px] font-medium px-3 py-2.5 -mb-px border-b-2 transition-colors ${
        active
          ? "border-[#c8d92e] text-[#161510] dark:text-white"
          : "border-transparent text-[#161510]/40 dark:text-white/40 hover:text-[#161510]/70 dark:hover:text-white/70"
      }`}
    >
      <Icon size={14} />
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// CHAT PANEL
// ─────────────────────────────────────────────

function ChatPanel() {
  const [visibleChars, setVisibleChars] = useState(0)
  const [activeMessage, setActiveMessage] = useState(0)
  const [showSecond, setShowSecond] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const currentText = DEMO_EXCHANGE[activeMessage].text

    if (visibleChars < currentText.length) {
      timeoutRef.current = setTimeout(() => setVisibleChars((v) => v + 1), 18)
    } else if (activeMessage === 0 && !showSecond) {
      timeoutRef.current = setTimeout(() => {
        setShowSecond(true)
        setActiveMessage(1)
        setVisibleChars(0)
      }, 900)
    } else if (activeMessage === 1) {
      timeoutRef.current = setTimeout(() => {
        setVisibleChars(0)
        setActiveMessage(0)
        setShowSecond(false)
      }, 3200)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [visibleChars, activeMessage, showSecond])

  const firstText = DEMO_EXCHANGE[0].text
  const secondText = DEMO_EXCHANGE[1].text
  const firstVisible = activeMessage === 0 ? visibleChars : firstText.length
  const secondVisible = activeMessage === 1 ? visibleChars : 0

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="h-7 w-7 rounded-full bg-[#c8d92e]/15 flex items-center justify-center text-[11px] font-medium text-[#8a9417] dark:text-[#c8d92e] shrink-0">
            AI
          </div>
          <div className="bg-[#f4f2ec] dark:bg-white/[0.05] rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
            <p className="text-[13.5px] leading-[1.55] text-[#161510] dark:text-white/90">
              {firstText.slice(0, firstVisible)}
              {activeMessage === 0 && firstVisible < firstText.length && <Cursor />}
            </p>
          </div>
        </div>

        {showSecond && (
          <div className="flex items-start gap-2.5 justify-end">
            <div className="bg-[#161510] dark:bg-[#c8d92e] rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
              <p className="text-[13.5px] leading-[1.55] text-white dark:text-[#161510]">
                {secondText.slice(0, secondVisible)}
                {activeMessage === 1 && secondVisible < secondText.length && <Cursor dark />}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#161510]/8 dark:border-white/8">
        <div className="flex-1 bg-[#f4f2ec] dark:bg-white/[0.05] rounded-full px-4 py-2.5">
          <span className="text-[13px] text-[#161510]/30 dark:text-white/25">
            Type your answer…
          </span>
        </div>
        <button className="h-9 w-9 rounded-full bg-[#c8d92e] flex items-center justify-center shrink-0">
          <Send size={14} className="text-[#161510]" />
        </button>
      </div>
    </div>
  )
}

function Cursor({ dark }: { dark?: boolean }) {
  return (
    <span
      className={`inline-block w-[2px] h-[12px] ml-0.5 animate-pulse ${
        dark ? "bg-[#161510]" : "bg-[#c8d92e]"
      }`}
      style={{ verticalAlign: "-1px" }}
      aria-hidden="true"
    />
  )
}

// ─────────────────────────────────────────────
// VOICE PANEL
// ─────────────────────────────────────────────

const BAR_COUNT = 36

function VoicePanel() {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => ({
      delay: Math.random() * 0.8,
      duration: 0.6 + Math.random() * 0.5,
    })),
  ).current

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-[3px] h-20">
        {bars.map((bar, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-[#c8d92e]"
            style={{
              height: "30%",
              animation: `wave ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c8d92e] animate-pulse" />
        <p className="text-[13px] text-[#161510]/50 dark:text-white/45">
          "Walk me through how you'd debug that in production…"
        </p>
      </div>

      <button className="h-11 w-11 rounded-full bg-[#161510] dark:bg-[#c8d92e] flex items-center justify-center">
        <Mic size={16} className="text-white dark:text-[#161510]" />
      </button>

      <style>{`
        @keyframes wave {
          0% { height: 20%; }
          100% { height: 95%; }
        }
      `}</style>
    </div>
  )
}