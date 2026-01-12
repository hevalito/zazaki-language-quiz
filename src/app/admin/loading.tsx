
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Sidebar Skeleton - Hidden on mobile, w-72 on Desktop */}
            <div className="hidden lg:flex w-72 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pt-5 pb-4 transition-colors">
                {/* Logo Area */}
                <div className="px-6 mb-8 mt-2">
                    <Skeleton className="h-8 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-3 space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 lg:px-8 justify-between transition-colors">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 lg:hidden rounded-md" /> {/* Mobile Menu Trigger Placeholder */}
                        <Skeleton className="h-6 w-32 hidden sm:block" /> {/* Breadcrumb/Title */}
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" /> {/* Notifications */}
                        <Skeleton className="h-8 w-8 rounded-full" /> {/* User */}
                    </div>
                </div>

                {/* Canvas */}
                <main className="flex-1 p-4 lg:p-8 space-y-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-9 w-48" /> {/* Page Title */}
                            <Skeleton className="h-9 w-32 rounded-md" /> {/* Action Button */}
                        </div>

                        {/* Dashboard-like Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                        </div>

                        {/* Main Table/Content Area */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 transition-colors">
                            <div className="flex justify-between mb-4">
                                <Skeleton className="h-8 w-64" /> {/* Search */}
                                <Skeleton className="h-8 w-24" /> {/* Filter */}
                            </div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
