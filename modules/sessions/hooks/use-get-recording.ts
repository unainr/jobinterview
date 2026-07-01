import { client } from "@/lib/hono"
import { useQuery } from "@tanstack/react-query"

export const useGetRecording = (sessionId: string | undefined, enabled: boolean) => {
	return useQuery({
		queryKey: ["session-recording", sessionId],
		queryFn: async () => {
			const response = await client.api.sessions[":sessionId"].recording.$get({
				param: { sessionId: sessionId! },
			})
			if (!response.ok) return null
			return await response.json()
		},
		enabled: enabled && !!sessionId,
		staleTime: 1000 * 60 * 5, // signed URL is short-lived but this avoids refetch spam within a session
	})
}