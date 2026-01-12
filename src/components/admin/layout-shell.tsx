"use client"

import { useState } from 'react'
import { AdminSidebar } from './sidebar'
import { AdminHeader } from './header'

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Sidebar */}
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:pl-0 transition-all duration-300">
                <AdminHeader setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 py-8">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
