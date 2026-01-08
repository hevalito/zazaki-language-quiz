import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminPageProps {
    children: ReactNode
    className?: string
}

export function AdminPage({ children, className }: AdminPageProps) {
    return (
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", className)}>
            {children}
        </div>
    )
}

interface AdminPageHeaderProps {
    title: string
    description?: ReactNode
    actions?: ReactNode
    className?: string
}

export function AdminPageHeader({ title, description, actions, className }: AdminPageHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                {description && (
                    <div className="mt-1 text-sm text-gray-500">
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    )
}

interface AdminPageContentProps {
    children: ReactNode
    className?: string
}

export function AdminPageContent({ children, className }: AdminPageContentProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {children}
        </div>
    )
}
