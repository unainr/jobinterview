import { client } from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
	(typeof client.api.sessions)[":id"]["vapi-call-id"]["$patch"]
>;
type RequestType = {
    sessionId: string;
    vapiCallId: string;
};

export const useUpdateSessions = () => {
	const queryClient = useQueryClient();
	return useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ sessionId, vapiCallId }) => {
            const response = await client.api.sessions[":id"]["vapi-call-id"].$patch({
                param: {  sessionId }, // ✅ real session DB id
                json: { vapiCallId },      // ✅ vapi call id in body
            });
            return await response.json();
        },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: agentKeys.all });
		},
	});
};
