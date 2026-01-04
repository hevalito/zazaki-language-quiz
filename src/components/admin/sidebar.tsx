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
    CalendarIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Courses', href: '/admin/courses', icon: AcademicCapIcon },
    { name: 'Quizzes', href: '/admin/quizzes', icon: ClipboardDocumentListIcon },
    { name: 'Daily Quiz', href: '/admin/daily-quiz', icon: CalendarIcon },
    { name: 'Questions', href: '/admin/questions', icon: QuestionMarkCircleIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Achievements', href: '/admin/achievements', icon: TrophyIcon },
]

interface AdminSidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export function AdminSidebar({ open, setOpen }: AdminSidebarProps) {
    const pathname = usePathname()

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
                        <nav className="mt-5 flex-1 space-y-1 px-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setOpen(false)} // Close on mobile navigation
                                        className={classNames(
                                            isActive
                                                ? 'bg-primary-50 text-brand-orange border-r-4 border-brand-orange'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                            'group flex items-center px-2 py-3 text-sm font-medium rounded-r-none rounded-l-md transition-all duration-200'
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                isActive ? 'text-brand-orange' : 'text-gray-400 group-hover:text-gray-500',
                                                'mr-3 h-6 w-6 flex-shrink-0'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Footer / User Info could go here */}
                    <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                        <div className="group block w-full flex-shrink-0">
                            <div className="flex items-center">
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                        v2.0.0
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
