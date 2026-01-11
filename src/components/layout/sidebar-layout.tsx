'use client'

import { useState, useEffect } from 'react'
import { DesktopNav } from './desktop-nav'
import { cn } from '@/lib/utils'
import { FeedbackWidget } from '@/components/features/feedback/feedback-widget'

export function SidebarLayout({ children, version, isAuthenticated }: { children: React.ReactNode, version?: string, isAuthenticated?: boolean }) {
    // Initialize with false, but try to read from localStorage on mount
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('sidebar_collapsed')
        if (saved) {
            setIsCollapsed(saved === 'true')
        }
    }, [])

    const toggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem('sidebar_collapsed', String(newState))
    }

    if (!isAuthenticated) {
        return <div className="min-h-full">{children}</div>
    }

    return (
        <div className="min-h-full pb-20 md:pb-0">
            <DesktopNav
                version={version}
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
            />
            <div
                className={cn(
                    "h-full transition-all duration-300",
                    isCollapsed ? "md:pl-20" : "md:pl-64"
                )}
            >
                {children}
            </div>

            {/* Global Feedback Trigger */}
            <FeedbackWidget />
        </div>
    )
}
