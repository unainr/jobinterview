import { InterviewView } from "@/modules/interview/view/interview-view";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function InterviewPage() {
  const {userId} = await auth()
        if(!userId) redirect("/sign-in");
  return (
   <>
   <InterviewView/>
   </>
  );
}
