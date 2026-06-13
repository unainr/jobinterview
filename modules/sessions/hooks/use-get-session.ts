import {client} from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import {useQuery} from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetSession = () => {
    return useQuery({
        queryKey: ["sessions"],
        queryFn: async () => {
            const response = await client.api.sessions.$get();
            if (!response.ok) {
                toast.error("Failed to fetch sessions");
            }
            return await response.json();
        }
    })
}