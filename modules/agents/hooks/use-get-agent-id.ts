import { InterviewAssistantConfig } from "@/lib/assistant";
import { client } from "@/lib/hono";
import { agentKeys } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Type guard to check if the response is a valid agent
function isAgent(data: unknown): data is InterviewAssistantConfig {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "role" in data &&
    "experienceLevel" in data &&
    "skills" in data
  );
}

export const useGetAgentId = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryKey: agentKeys.detail(id),
    queryFn: async (): Promise<InterviewAssistantConfig> => {
      const res = await client.api.agents[":id"].$get({ param: { id } });

      if (!res.ok) {
        toast.error("Failed to fetch agent");
        throw new Error("Failed to fetch agent");
      }

      const data = await res.json();

      if (!isAgent(data)) {
        throw new Error("Invalid agent data");
      }

      return data;
    },
  });
};