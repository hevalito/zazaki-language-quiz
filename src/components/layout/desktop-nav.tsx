'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'
import { cn } from '@/lib/utils'

import {
    HomeIcon,
    BookOpenIcon,
    TrophyIcon,
    UserIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    BookOpenIcon as BookOpenIconSolid,
    TrophyIcon as TrophyIconSolid,
    UserIcon as UserIconSolid,
    AcademicCapIcon as AcademicCapIconSolid,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

interface DesktopNavProps {
    version?: string
    isCollapsed?: boolean
    onToggle?: () => void
}

export function DesktopNav({ version = '2.5.2', isCollapsed = false, onToggle }: DesktopNavProps) {
    const pathname = usePathname()
    const { t } = useTranslation()

    // Hide on strictly public routes if needed, but usually Sidebar manages its own visibility based on layout. 
    // Assuming this component is only rendered in the main authenticated layout wrapper.

    const items = [
        {
            name: t('nav.home', 'Home'),
            href: '/',
            icon: HomeIcon,
            activeIcon: HomeIconSolid,
        },
        {
            name: t('nav.library', 'Üben'),
            href: '/library',
            icon: BookOpenIcon,
            activeIcon: BookOpenIconSolid,
        },
        {
            name: t('nav.learning', 'Lernraum'),
            href: '/learning',
            icon: AcademicCapIcon,
            activeIcon: AcademicCapIconSolid,
            tourId: 'tour-learning-room-nav'
        },
        {
            name: t('nav.leaderboard', 'Bestenliste'),
            href: '/leaderboard',
            icon: TrophyIcon,
            activeIcon: TrophyIconSolid,
            tourId: 'tour-leaderboard-nav'
        },
        {
            name: t('nav.profile', 'Profil'),
            href: '/profile',
            icon: UserIcon,
            activeIcon: UserIconSolid,
            tourId: 'tour-profile-nav'
        },
    ]

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col fixed inset-y-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header / Logo */}
            <div className={cn(
                "h-16 flex items-center border-b border-gray-100 dark:border-gray-800 transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-6"
            )}>
                <Link href="/" className="flex items-center space-x-3 group overflow-hidden">
                    <div className="relative w-8 h-8 flex-shrink-0 transition-transform transform group-hover:scale-110">
                        <Image
                            src="/images/logo-icon.png"
                            alt="Zazakî"
                            fill
                            className="object-contain"
                            suppressHydrationWarning
                        />
                    </div>
                    <span
                        className={cn(
                            "font-serif font-bold text-xl text-gray-900 dark:text-gray-100 tracking-tight transition-opacity duration-200 whitespace-nowrap",
                            isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                        )}
                    >
                        Zazakî Quiz
                    </span>
                </Link>
            </div>

            {/* Toggle Button (Absolute positioned on the border) */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-colors z-50"
            >
                {isCollapsed ? (
                    <ChevronRightIcon className="w-3 h-3" />
                ) : (
                    <ChevronLeftIcon className="w-3 h-3" />
                )}
            </button>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {items.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href)

                    const Icon = isActive ? item.activeIcon : item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            id={item.tourId}
                            className={cn(
                                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative",
                                isActive
                                    ? "text-primary-700 dark:text-primary-100 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100/50"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800",
                                isCollapsed && "justify-center"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="desktop-nav-indicator"
                                    className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <Icon className={cn(
                                "flex-shrink-0 w-6 h-6 transition-colors",
                                isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                                !isCollapsed && "mr-3"
                            )} />

                            {!isCollapsed && (
                                <span className="truncate">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Copyright / Version */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 overflow-hidden">
                {!isCollapsed ? (
                    <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                            Zazakî Academy
                        </p>
                        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-0.5">
                            v{version} Beta
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <p className="text-[10px] text-center text-gray-400">
                            v{version.split('.')[0]}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    )
}
