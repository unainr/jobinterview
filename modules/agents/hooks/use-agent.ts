import {client} from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import {useQuery} from "@tanstack/react-query";
import { toast } from "sonner";

export const useAgent = () => {
    return useQuery({
        queryKey: agentKeys.all,
        queryFn: async () => {
            const response = await client.api.agents.$get();
            if (!response.ok) {
                toast.error("Failed to fetch agents");
            }
            return await response.json();
        }
    })
}