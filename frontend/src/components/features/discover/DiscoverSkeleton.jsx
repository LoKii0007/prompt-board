import { Skeleton } from "@/components/ui/skeleton";

export function DiscoverSkeleton() {
    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 mx-auto">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="break-inside-avoid relative rounded-xl overflow-hidden mb-4 border border-white/5 bg-muted/20"
                >
                    {/* Simulate varying aspect ratios for masonry effect */}
                    <Skeleton
                        className="w-full"
                        style={{
                            height: `${Math.floor(Math.random() * (400 - 200 + 1) + 200)}px`,
                        }}
                    />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
