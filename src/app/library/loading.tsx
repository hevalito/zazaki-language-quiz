
import { Skeleton } from "@/components/ui/skeleton"

export default function LibraryLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-full" /> {/* Back Button */}
                        <Skeleton className="w-10 h-10 rounded-lg" /> {/* Icon */}
                        <div className="space-y-1">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Search Bar */}
                <Skeleton className="w-full h-12 rounded-xl mb-6" />

                {/* Filter Bar */}
                <div className="flex space-x-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
                    ))}
                </div>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 h-48 flex flex-col transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="w-8 h-8 rounded-lg" />
                            </div>
                            <div className="flex-1"></div>
                            <div className="flex items-center justify-between mt-auto">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
