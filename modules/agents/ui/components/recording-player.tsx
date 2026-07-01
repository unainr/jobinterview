import { useGetRecording } from "@/modules/sessions/hooks/use-get-recording"
import { Volume2Icon } from "lucide-react"

export function RecordingPlayer({ sessionId }: { sessionId: string }) {
  const { data, isLoading, isError } = useGetRecording(sessionId, true)

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-[#131312] ring-1 ring-[#161510]/[0.07] dark:ring-white/[0.08]">
      <div className="flex items-center gap-2 mb-3">
        <Volume2Icon className="size-3.5 text-[#161510]/35 dark:text-white/40" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#161510]/40 dark:text-white/40">
          Call Recording
        </p>
      </div>

      {isLoading && (
        <p className="text-[13px] text-[#161510]/40 dark:text-white/40">Loading recording…</p>
      )}

      {isError || (!isLoading && !data?.url) ? (
        <p className="text-[13px] text-[#161510]/40 dark:text-white/40">Recording unavailable.</p>
      ) : null}

      {data?.url && (
        <audio controls src={data.url} className="w-full h-10" style={{ accentColor: "#c8d92e" }} />
      )}
    </div>
  )
}