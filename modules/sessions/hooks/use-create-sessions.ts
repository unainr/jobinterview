import { client } from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.sessions.$post>
type RequestType = InferRequestType<typeof client.api.sessions.$post>["json"]

export const useCreateSession = () => {
     const queryClient = useQueryClient()
        return useMutation<ResponseType, Error, RequestType>({
            mutationFn: async (json) => {
                
                const response = await client.api.sessions.$post({json});
                
                if (!response.ok) {
                    throw new Error("Failed to create agent");
                }
    
                return await response.json();
            },
    
            onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
                
            },
        })
}