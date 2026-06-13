import { AgentView } from "@/modules/agents/ui/agents-view";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
interface Props {
	params: Promise<{ id: string }>;
}
const Agent = async ({ params }: Props) => {
	const { id } = await params;

	const user = await currentUser();
	if (!user) return redirect("/sign-in");
	

	return (
		<AgentView	id={id}  user={{
                firstName: user?.firstName ?? null,
                imageUrl: user?.imageUrl ?? null,
            }}/>
	);
};

export default Agent;
