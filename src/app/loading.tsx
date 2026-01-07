import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-md safe-area-top safe-area-bottom">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Main Content Area - Mimic Card Grid */}
            <div className="grid grid-cols-1 gap-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>

            {/* Navigation Bar Placeholder */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t p-2 flex justify-around items-center safe-area-bottom">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
        </div>
    )
}
