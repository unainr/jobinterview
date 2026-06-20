"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  ZapIcon,
  TrendingUpIcon,
  RotateCcwIcon,
  MicIcon,
  ChevronDownIcon,
  Volume2Icon,
} from "lucide-react"
import { useGetSession } from "@/modules/sessions/hooks/use-get-session"
import { GenerateFeedbackButton } from "@/modules/agents/ui/components/generate-feedback"

// ─────────────────────────────────────────────
// TYPES — matches the actual AI feedback route output
// ─────────────────────────────────────────────

type Recommendation = "hire" | "consider" | "no_hire"

type FeedbackResult = {
  overallScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  technicalScore: number
  communicationScore: number
  recommendation: Recommendation
}

function parseFeedback(raw: string | null): FeedbackResult | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const RECOMMENDATION_MAP: Record<Recommendation, { label: string; accent: string }> = {
  hire: { label: "Strong performance", accent: "#c8d92e" },
  consider: { label: "Solid effort", accent: "#e0b341" },
  no_hire: { label: "Needs more practice", accent: "#d97757" },
}

// ─────────────────────────────────────────────
// HERO SCORE — large centered ring, the page's
// one dominant visual moment instead of competing
// with the rest of the card grid
// ─────────────────────────────────────────────

function HeroScoreRing({ score, accent }: { score: number; accent: string }) {
  const r = 64
  const circ = 2 * Math.PI * r
  const dash = (Math.min(Math.max(score, 0), 100) / 100) * circ

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-[#161510]/6 dark:stroke-white/[0.07]"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          strokeWidth="8"
          stroke={accent}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="text-[40px] font-semibold text-[#161510] dark:text-white tabular-nums"
          style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
        >
          {score}
        </span>
        <span className="text-[11px] text-[#161510]/40 dark:text-white/35 mt-1 tracking-wide">
          out of 100
        </span>
      </div>
    </div>
  )
}

function SubScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-[#161510]/65 dark:text-white/60">{label}</span>
        <span className="text-[13px] font-semibold text-[#161510] dark:text-white tabular-nums">
          {score}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#161510]/6 dark:bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#c8d92e] transition-all duration-700"
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

function TranscriptSection({ transcript, agentName }: { transcript: string; agentName: string }) {
  const lines = transcript.split("\n").filter(Boolean)

  return (
    <details className="group rounded-2xl overflow-hidden bg-white dark:bg-[#131312] ring-1 ring-[#161510]/[0.07] dark:ring-white/8">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-[#faf9f5] dark:hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-2">
          <MicIcon className="size-3.5 text-[#161510]/35 dark:text-white/40" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#161510]/45 dark:text-white/45">
            Transcript
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#161510]/5 dark:bg-white/8 text-[#161510]/40 dark:text-white/45">
            {lines.length} lines
          </span>
        </div>
        <ChevronDownIcon className="size-4 text-[#161510]/35 dark:text-white/40 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div
        className="border-t border-[#161510]/[0.07] dark:border-white/8 p-4 flex flex-col gap-2.5 max-h-80 overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        {lines.map((line, i) => {
          const isCandidate = line.startsWith("Candidate:")
          const text = line.replace(/^(Candidate|Interviewer):\s*/, "")
          return (
            <div key={i} className={cn("flex flex-col gap-0.5", isCandidate ? "items-end" : "items-start")}>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#161510]/35 dark:text-white/40 px-1">
                {isCandidate ? "You" : agentName}
              </span>
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                  isCandidate
                    ? "bg-[#161510] dark:bg-[#c8d92e] text-white dark:text-[#161510] rounded-tr-[5px]"
                    : "bg-[#f4f2ec] dark:bg-white/[0.07] text-[#161510]/85 dark:text-white/85 rounded-tl-[5px]",
                )}
              >
                {text || line}
              </div>
            </div>
          )
        })}
      </div>
    </details>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

const FeedBackView = () => {
  const { data, isLoading } = useGetSession()
  const call = data?.find((call) => call.id)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-[#161510]/15 dark:border-white/15 border-t-[#c8d92e] animate-spin" />
      </main>
    )
  }

  if (!call) return null

  // ── Not generated yet ──────────────────────
  if (call.status !== "completed" || !call.feedback) {
    return (
      <main className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[60%] rounded-full opacity-[0.12] dark:opacity-[0.08] blur-3xl"
            style={{ background: "radial-gradient(circle, #c8d92e, transparent 70%)" }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-5 text-center max-w-xs w-full">
          <div className="size-16 rounded-2xl bg-[#161510] dark:bg-[#c8d92e] flex items-center justify-center shadow-lg shadow-[#161510]/15 dark:shadow-[#c8d92e]/20">
            <MicIcon className="size-7 text-white dark:text-[#161510]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <p
              className="text-xl font-semibold text-[#161510] dark:text-white tracking-tight"
              style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
            >
              Interview Complete
            </p>
            <p className="text-[13px] text-[#161510]/45 dark:text-white/45">
              Your AI coach is ready to review your performance
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {[call.agentName, call.agentRole, (call.agentExperienceLevel ?? "").replace(/_/g, " ")]
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#161510]/5 dark:bg-white/8 text-[#161510]/60 dark:text-white/55 capitalize"
                >
                  {tag}
                </span>
              ))}
          </div>

          <GenerateFeedbackButton sessionId={call.id} vapiCallId={call.vapiCallId!} />

         
        </div>
      </main>
    )
  }

  // ── Feedback ready ──────────────────────────
  const feedback = parseFeedback(call.feedback)
  const recommendation = feedback?.recommendation ?? "consider"
  const recCfg = RECOMMENDATION_MAP[recommendation]

  const card = "rounded-2xl p-6 bg-white dark:bg-[#131312] ring-1 ring-[#161510]/[0.07] dark:ring-white/[0.08]"

  return (
    <main className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a] relative">
      {/* ambient glow, restrained, matches hero treatment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] right-[5%] w-[40%] h-[45%] rounded-full opacity-[0.1] dark:opacity-[0.08] blur-3xl"
          style={{ background: `radial-gradient(circle, ${recCfg.accent}, transparent 70%)` }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 flex flex-col gap-5">

        {/* ── hero score moment ── */}
        {feedback && (
          <div className={cn(card, "flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left")}>
            <HeroScoreRing score={feedback.overallScore} accent={recCfg.accent} />

            <div className="flex-1 min-w-0">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium mb-3"
                style={{ background: `${recCfg.accent}1a`, color: recCfg.accent }}
              >
                <span className="size-1.5 rounded-full shrink-0" style={{ background: recCfg.accent }} />
                {recCfg.label}
              </span>

              <h1
                className="text-[26px] font-semibold text-[#161510] dark:text-white tracking-tight mb-1"
                style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
              >
                {call.agentName}
              </h1>

              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mt-3">
                {[(call.agentExperienceLevel ?? "").replace(/_/g, " "), call.agentRole, call.agentSkills ?? ""]
                  .filter(Boolean)
                  .map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-[#161510]/5 dark:bg-white/8 text-[#161510]/60 dark:text-white/55 capitalize"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* recording */}
        {call.recordingUrl && (
          <div className={card}>
            <div className="flex items-center gap-2 mb-3">
              <Volume2Icon className="size-3.5 text-[#161510]/35 dark:text-white/40" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#161510]/40 dark:text-white/40">
                Call Recording
              </p>
            </div>
            <audio controls src={call.recordingUrl} className="w-full h-10" style={{ accentColor: "#c8d92e" }} />
          </div>
        )}

        {feedback ? (
          <>
            {/* summary + breakdown, combined for tighter rhythm */}
            <div className={card}>
              <p className="text-[14px] text-[#161510]/75 dark:text-white/75 leading-relaxed mb-6">
                {feedback.summary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-5 border-t border-[#161510]/6 dark:border-white/8">
                <SubScoreBar label="Technical depth" score={feedback.technicalScore} />
                <SubScoreBar label="Communication" score={feedback.communicationScore} />
              </div>
            </div>

            {/* strengths + improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={card}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-7 rounded-lg bg-[#c8d92e]/15 flex items-center justify-center">
                    <TrendingUpIcon className="size-3.5 text-[#8a9417] dark:text-[#c8d92e]" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#161510]/45 dark:text-white/45">
                    What went well
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2Icon className="size-4 text-[#c8d92e] shrink-0 mt-0.5" />
                      <span className="text-[13px] text-[#161510]/75 dark:text-white/75 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={card}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-7 rounded-lg bg-[#d97757]/12 flex items-center justify-center">
                    <AlertCircleIcon className="size-3.5 text-[#d97757]" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#161510]/45 dark:text-white/45">
                    Areas to improve
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <AlertCircleIcon className="size-4 text-[#d97757] shrink-0 mt-0.5" />
                      <span className="text-[13px] text-[#161510]/75 dark:text-white/75 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* coach tip */}
            <div className="rounded-2xl p-6 flex gap-4 bg-[#161510] dark:bg-[#131312] ring-1 ring-white/10 dark:ring-white/8">
              <div className="size-9 rounded-xl bg-[#c8d92e]/15 flex items-center justify-center shrink-0">
                <ZapIcon className="size-4 text-[#c8d92e]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/45 uppercase tracking-widest mb-1.5">
                  Next focus
                </p>
                <p className="text-[13px] text-white/80 leading-relaxed">
                  {recCfg.label} — overall score {feedback.overallScore}/100. Focus next session on{" "}
                  {feedback.improvements[0]?.toLowerCase() ?? "refining your responses"}.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className={cn(card, "text-center text-[13px] text-[#161510]/40 dark:text-white/40 py-12")}>
            Feedback unavailable for this session.
          </div>
        )}

        {/* transcript */}
        {call.transcript && <TranscriptSection transcript={call.transcript} agentName={call.agentName!} />}

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2 pb-8">
          <Link
            href="/calls/new"
            className="flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-medium bg-white dark:bg-[#131312] ring-1 ring-[#161510]/8 dark:ring-white/10 text-[#161510]/80 dark:text-white/80 hover:bg-[#faf9f5] dark:hover:bg-white/5 transition-colors"
          >
            <RotateCcwIcon className="size-3.5" />
            Practice again
          </Link>
          <Link
            href="/interview"
            className="flex items-center justify-center py-3 rounded-full text-[13px] font-medium bg-[#161510] dark:bg-[#c8d92e] text-white dark:text-[#161510] hover:bg-[#161510]/85 dark:hover:bg-[#c8d92e]/85 transition-colors"
          >
          Back to interviews
          </Link>
        </div>
      </div>
    </main>
  )
}

export default FeedBackView