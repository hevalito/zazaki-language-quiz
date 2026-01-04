"use client"

import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

interface AdminHeaderProps {
    setSidebarOpen: (open: boolean) => void
}

export function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
    return (
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
            {/* Mobile Menu Button */}
            <button
                type="button"
                className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Header Content */}
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1">
                    {/* Search bar could go here */}
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                    {/* Back to App Button */}
                    <a
                        href="/"
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4 text-gray-500" />
                        Back to App
                    </a>
                </div>
            </div>
        </div>
    )
}
