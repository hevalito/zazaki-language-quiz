"use client"

import { useEffect, useState } from 'react'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'


import { useTranslation, useTranslationContext } from '@/hooks/use-translation'

// We need data structure to match new translation type
// But badges themselves have DE/EN in their fields.
// The UI shell needs tokenization.

interface Badge {
    id: string
    code: string
    title: { [key: string]: string }
    description: { [key: string]: string }
    conditionLabel?: { [key: string]: string }
    criteria: any
    isEarned: boolean
    earnedAt?: string
}

export function AchievementScreen() {
    const { t } = useTranslation() // Hook for UI strings
    const { locale } = useTranslationContext() // Get current locale for badge content
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In a real implementation, we'd have a dedicated API endpoint for this
        // For now, we'll simulate it or reuse the progress endpoint if it included badges
        // Let's assume we create a new endpoint /api/user/achievements or mock it using existing data

        // FETCH MOCK/REAL DATA
        // Since we don't have a dedicated endpoint yet, let's fetch user progress which has badges
        // or create a dedicated endpoint. 
        // To match the plan, let's assume we add a dedicated simple fetch here or update user/progress

        const fetchBadges = async () => {
            try {
                // Fetch user progress which includes owned badges (we need to update that endpoint or create new one)
                // For MVP, let's hit a new endpoint we'll create: /api/user/badges
                const response = await fetch('/api/user/badges')
                if (response.ok) {
                    const data = await response.json()
                    setBadges(data)
                }
            } catch (error) {
                console.error("Error fetching badges:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBadges()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
            </div>
        )
    }

    // Helper for translations (Badge content itself)
    // We try to use the 'locale' from context, strictly falling back to 'de'.
    const getLocalizedContent = (field: any) => {
        if (!field) return ''
        return field[locale] || field['de'] || field['en'] || ''
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/"
                            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label={t('nav.back', 'Zurück')}
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <SparklesIconSolid className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('achievements.title', 'Erfolge')}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('achievements.subtitle', 'Sammle Trophäen')}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div id="achievements-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <Link
                            href={`/achievements/${badge.id}`}
                            key={badge.id}
                            className={`block bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 p-4 transition-all hover:shadow-md hover:scale-[1.02] ${badge.isEarned
                                ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10'
                                : 'border-gray-100 dark:border-gray-800 opacity-70 grayscale'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${badge.isEarned ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                    {/* Icon Logic */}
                                    {(badge as any).imageUrl ? (
                                        <div className="relative w-12 h-12">
                                            {/* Bloom/Blur effect container */}
                                            <div className={`absolute inset-0 rounded-full overflow-hidden ${!badge.isEarned ? 'grayscale brightness-50 contrast-125' : ''}`}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <Image
                                                    src={(badge as any).imageUrl}
                                                    alt={getLocalizedContent(badge.title)}
                                                    width={48}
                                                    height={48}
                                                    className={`w-full h-full object-cover ${!badge.isEarned ? 'blur-sm scale-110' : ''}`}
                                                />
                                            </div>
                                            {/* Lock Overlay */}
                                            {!badge.isEarned && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                    <LockClosedIcon className="w-5 h-5 text-white/80 drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (badge as any).iconUrl && ((badge as any).iconUrl.startsWith('http') || (badge as any).iconUrl.startsWith('/')) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <Image
                                            src={(badge as any).iconUrl}
                                            alt={getLocalizedContent(badge.title)}
                                            width={32}
                                            height={32}
                                            className={`w-8 h-8 object-contain ${!badge.isEarned && 'grayscale opacity-50'}`}
                                        />
                                    ) : (badge as any).iconUrl ? (
                                        <span className={`text-2xl ${!badge.isEarned && 'grayscale opacity-50 filter'}`} role="img" aria-label={getLocalizedContent(badge.title)}>
                                            {(badge as any).iconUrl}
                                        </span>
                                    ) : (
                                        badge.isEarned ? (
                                            <SparklesIconSolid className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        ) : (
                                            <LockClosedIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                        )
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${badge.isEarned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}`}>
                                        {getLocalizedContent(badge.title)}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {getLocalizedContent(badge.description)}
                                    </p>

                                    {/* Condition Label */}
                                    {getLocalizedContent(badge.conditionLabel) && (
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
                                            {getLocalizedContent(badge.conditionLabel)}
                                        </p>
                                    )}

                                    {badge.isEarned && (
                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                            {t('achievements.unlockedOn', 'Freigeschaltet am')} {new Date(badge.earnedAt!).toLocaleDateString()}
                                        </p>
                                    )}

                                    {/* Progress Bar for Locked Items */}
                                    {!badge.isEarned && (badge as any).progress && (badge as any).progress.target > 0 && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                                <span>{t('achievements.progress', 'Fortschritt')}</span>
                                                <span className="font-medium">{(badge as any).progress.display}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-purple-500 dark:bg-purple-500 h-full rounded-full opacity-60"
                                                    style={{ width: `${Math.min(100, Math.max(0, ((badge as any).progress.current / (badge as any).progress.target) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {badge.isEarned && (
                                        <p className="text-xs text-purple-600 mt-2 font-medium">
                                            {t('achievements.unlockedOn', 'Freigeschaltet am')} {new Date(badge.earnedAt!).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                    }
                </div >
            </div >
        </div >
    )
}
