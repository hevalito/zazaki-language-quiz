import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 shrink-0">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                        </div>
                        <div className="space-y-1.5 py-0.5">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-16 rounded-full" /> {/* Streak */}
                        <Skeleton className="h-10 w-10 rounded-full" /> {/* Settings */}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-6 space-y-6">

                {/* Daily Goal Card (Large) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-56 relative overflow-hidden">
                    <div className="flex justify-between items-start z-10">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="space-y-4 z-10">
                        <Skeleton className="h-4 w-full rounded-full" />
                        <div className="flex justify-between gap-4">
                            <Skeleton className="h-12 w-1/3 rounded-lg" />
                            <Skeleton className="h-12 w-1/3 rounded-lg" />
                            <Skeleton className="h-12 w-1/3 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Next Quiz / Challenge */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-32 flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>

                {/* Continue Learning */}
                <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-10 rounded-xl" />
                            <Skeleton className="h-10 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 flex flex-col items-center justify-center h-32 border border-gray-100 shadow-sm space-y-3">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="space-y-1 w-full flex flex-col items-center">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
