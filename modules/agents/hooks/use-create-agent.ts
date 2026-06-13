import { client } from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from 'hono/client';


type ResponseType = InferResponseType<typeof client.api.agents.$post,201>
type RequestType = InferRequestType<typeof client.api.agents.$post>["json"]

export const useCreateAgent = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            
            const response = await client.api.agents.$post({json});
            
            if (!response.ok) {
                throw new Error("Failed to create agent");
            }

            return await response.json();
        },

        onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: agentKeys.all});

        },
    })
}