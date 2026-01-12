'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
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

import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

export function MobileNav() {
    const pathname = usePathname()

    const { t } = useTranslation()
    const { data: session } = useSession()

    // Hide on:
    // 1. Admin routes
    // 2. Auth pages (sign-in/up)
    // 3. Share pages (always focused view)
    // 4. Public Landing Page (Home "/" when not logged in)
    if (
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/sign-in') ||
        pathname?.startsWith('/sign-up') ||
        pathname?.startsWith('/share') ||
        (pathname === '/' && !session)
    ) {
        return null
    }

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
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" />

            <nav className="relative flex justify-around items-center h-16 px-2">
                {items.map((item) => {
                    // Special handling for Home route to avoid matching everything
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href)

                    const Icon = isActive ? item.activeIcon : item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            id={item.tourId}
                            className="relative flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200 outline-none select-none touch-manipulation group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-indicator"
                                    className="absolute -top-[1px] w-12 h-[2px] bg-primary-500 rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <div className={cn(
                                "relative p-1.5 rounded-xl transition-all duration-200 group-active:scale-95",
                                isActive ? "text-primary-600 dark:text-primary-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-bg"
                                        className="absolute inset-0 bg-primary-100/50 dark:bg-primary-900/30 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <Icon className="relative w-6 h-6" />
                            </div>

                            <span className={cn(
                                "mt-0.5 text-[10px] tracking-tight transition-colors duration-200",
                                isActive ? "text-primary-700 dark:text-primary-400 font-semibold" : "text-gray-500 dark:text-gray-500"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
