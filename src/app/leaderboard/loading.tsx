
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-5 h-5" /> {/* Back Icon */}
                        <Skeleton className="h-6 w-32" /> {/* Title */}
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4">
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                        <div className="flex-1 py-3 flex justify-center border-b-2 border-gray-200 dark:border-gray-800">
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex-1 py-3 flex justify-center">
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard List */}
            <main className="container mx-auto px-4 py-6 max-w-2xl space-y-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="w-10 h-10 rounded-full" /> {/* Rank/Trophy */}
                            <div className="flex items-center space-x-3">
                                <Skeleton className="w-10 h-10 rounded-full" /> {/* Avatar */}
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-5 w-16" /> {/* XP */}
                    </div>
                ))}
            </main>
        </div>
    )
}
