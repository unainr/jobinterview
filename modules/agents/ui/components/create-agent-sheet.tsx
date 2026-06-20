"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateAgentForm } from "./create-agents-form";

export function CreateAgentSheet() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={'primary'} className="gap-2">
          <PlusIcon className="size-4" />
          Create Agent
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <PlusIcon className="size-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold tracking-tight">
                Create new agent
              </SheetTitle>
              <SheetDescription className="text-sm mt-0.5">
                Configure the role, expertise, and skills of your AI interviewer.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <CreateAgentForm onSuccessAction={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}