
import { Skeleton } from "@/components/ui/skeleton"

export default function QuizLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="w-5 h-5" /> {/* Back Icon */}
                            <Skeleton className="w-12 h-4" /> {/* Back Text */}
                        </div>

                        <div className="flex flex-col items-center">
                            <Skeleton className="h-6 w-32 mb-1" /> {/* Title */}
                            <Skeleton className="h-4 w-24" /> {/* Subtitle */}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Skeleton className="w-4 h-4" /> {/* Icon */}
                            <Skeleton className="w-12 h-4" /> {/* Progress Text */}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <Skeleton className="w-full h-2 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Question Card Skeleton */}
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Meta Row */}
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-3 mb-8">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>

                    {/* Choices */}
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>

                    {/* Footer Nav */}
                    <div className="flex justify-between mt-8">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                    </div>
                </div>
            </main>
        </div>
    )
}
