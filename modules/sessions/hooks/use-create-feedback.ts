import { client } from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.sessions.feedback.$post>
type RequestType = InferRequestType<typeof client.api.sessions.feedback.$post>["json"]



export const useCreateFeedBack = ()=>{
  const qc = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({sessionId, vapiCallId}) => {
            
            const response = await client.api.sessions.feedback.$post({json:{sessionId, vapiCallId}});
            
            if (!response.ok) {
                throw new Error("Failed to create agent");
            }
    
            return await response.json();
        },
    
        onSuccess: (_, { sessionId }) => {
              qc.invalidateQueries({ queryKey: ["sessions"] })
      qc.invalidateQueries({ queryKey: ["sessions", sessionId] })
    
        },
    })
}