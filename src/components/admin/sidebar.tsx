"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    AcademicCapIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
    TrophyIcon,
    XMarkIcon,
    QuestionMarkCircleIcon,
    CalendarIcon,
    PaperAirplaneIcon,
    Cog6ToothIcon,
    LanguageIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import useSWR from 'swr'

const navigationGroups = [
    {
        title: '',
        items: [
            { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        ]
    },
    {
        title: 'Content',
        items: [
            { name: 'Courses', href: '/admin/courses', icon: AcademicCapIcon },
            { name: 'Quizzes', href: '/admin/quizzes', icon: ClipboardDocumentListIcon },
            { name: 'Questions', href: '/admin/questions', icon: QuestionMarkCircleIcon },
            { name: 'Translations', href: '/admin/translations', icon: LanguageIcon },
        ]
    },
    {
        title: 'Engagement',
        items: [
            { name: 'Daily Quiz', href: '/admin/daily-quiz', icon: CalendarIcon },
            { name: 'Achievements', href: '/admin/achievements', icon: TrophyIcon },
            { name: 'Push Broadcast', href: '/admin/push', icon: PaperAirplaneIcon },
        ]
    },
    {
        title: 'Support & Users',
        items: [
            { name: 'Users', href: '/admin/users', icon: UsersIcon },
            { name: 'Feedback', href: '/admin/feedback', icon: ChatBubbleLeftRightIcon, badge: 'openFeedbackCount' },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
        ]
    }
]

interface AdminSidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function AdminSidebar({ open, setOpen }: AdminSidebarProps) {
    const pathname = usePathname()
    const { data: stats } = useSWR('/api/admin/stats', fetcher, { refreshInterval: 30000 })

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            <div
                className={classNames(
                    open ? 'fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity' : 'hidden',
                    'lg:hidden'
                )}
                onClick={() => setOpen(false)}
            />

            {/* Sidebar Component */}
            <div className={classNames(
                open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                'fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:flex lg:w-72 lg:flex-col'
            )}>
                {/* Sidebar Content */}
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">

                        {/* Logo Area */}
                        <div className="flex flex-shrink-0 items-center px-4 mb-5">
                            <div className="flex flex-col">
                                <span className="text-2xl font-serif font-bold text-gray-900">Zazakî Admin</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Management Console</span>
                            </div>
                            {/* Mobile Close Button */}
                            <button
                                className="ml-auto lg:hidden text-gray-500"
                                onClick={() => setOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Navigation */}
                        {/* Navigation Groups */}
                        <div className="flex-1 px-2 space-y-6">
                            {navigationGroups.map((group) => (
                                <div key={group.title}>
                                    {group.title && (
                                        <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            {group.title}
                                        </h3>
                                    )}
                                    <div className="space-y-1">
                                        {group.items.map((item) => (
                                            <NavItem key={item.name} item={item} pathname={pathname} setOpen={setOpen} stats={stats} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / User Info could go here */}
                    <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                        <div className="group block w-full flex-shrink-0">
                            <div className="flex items-center">
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                        v{process.env.NEXT_PUBLIC_APP_VERSION}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function NavItem({ item, pathname, setOpen, stats }: any) {
    const isActive = pathname === item.href
    const badgeCount = item.badge && stats ? stats[item.badge] : 0

    return (
        <Link
            href={item.href}
            onClick={() => setOpen(false)}
            className={classNames(
                isActive
                    ? 'bg-primary-50 text-brand-orange border-r-4 border-brand-orange'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-r-none rounded-l-md transition-all duration-200'
            )}
        >
            <item.icon
                className={classNames(
                    isActive ? 'text-brand-orange' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
            />
            <span className="flex-1">{item.name}</span>
            {badgeCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {badgeCount}
                </span>
            )}
        </Link>
    )
}
