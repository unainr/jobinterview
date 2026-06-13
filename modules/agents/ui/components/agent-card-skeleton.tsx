import { Skeleton } from "@/components/ui/skeleton";

export function AgentCardSkeleton() {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            {/* Avatar + name */}
            <div className="flex items-start gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 pt-0.5">
                    <Skeleton className="h-3.5 w-[70%]" />
                    <Skeleton className="h-3 w-[50%]" />
                </div>
            </div>

            {/* Experience badge */}
            <Skeleton className="h-5 w-14 rounded-full mb-3" />

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-12 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="h-6 w-10 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
            </div>
        </div>
    );
}