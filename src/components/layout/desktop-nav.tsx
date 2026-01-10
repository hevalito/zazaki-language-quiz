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
    AcademicCapIcon as AcademicCapIconSolid
} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

export function DesktopNav() {
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
        },
        {
            name: t('nav.leaderboard', 'Bestenliste'),
            href: '/leaderboard',
            icon: TrophyIcon,
            activeIcon: TrophyIconSolid,
        },
        {
            name: t('nav.profile', 'Profil'),
            href: '/profile',
            icon: UserIcon,
            activeIcon: UserIconSolid,
        },
    ]

    return (
        <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-40">
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="relative w-8 h-8 transition-transform transform group-hover:scale-110">
                        <Image
                            src="/images/logo-icon.png"
                            alt="Zazakî"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-serif font-bold text-xl text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
                        Zazakî Quiz
                    </span>
                </Link>
            </div>

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
                            className={cn(
                                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative",
                                isActive
                                    ? "text-primary-700 bg-primary-50 hover:bg-primary-100/50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                                "flex-shrink-0 w-6 h-6 mr-3 transition-colors",
                                isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                            )} />

                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Copyright / Version */}
            <div className="p-4 border-t border-gray-100">
                <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-center text-gray-500 font-medium">
                        Zazakî Academy
                    </p>
                    <p className="text-[10px] text-center text-gray-400 mt-0.5">
                        v2.0.0 Beta
                    </p>
                </div>
            </div>
        </aside>
    )
}
