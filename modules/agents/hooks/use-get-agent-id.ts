import { client } from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetAgentId = (slug: string) => {
    return useQuery({
        enabled: !!slug,
        queryKey: agentKeys.detail(slug),
        queryFn: async () => {
            const res = await client.api.agents[":slug"].$get({param:{slug}});

            if (!res.ok) toast.error("Failed to fetch agent");
            return await res.json();
        },
    });

}
