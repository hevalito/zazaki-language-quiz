"use client"

import { useEffect, useState } from 'react'
import { TrophyIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyIconSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Badge {
    id: string
    code: string
    title: { [key: string]: string }
    description: { [key: string]: string }
    criteria: any
    isEarned: boolean
    earnedAt?: string
}

export function AchievementScreen() {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    // Helper for translations
    const getTitle = (t: any) => t?.de || t?.en || 'Erfolg'
    const getDescription = (t: any) => t?.de || t?.en || ''

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <Link href="/" className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <TrophyIconSolid className="w-6 h-6 text-purple-600 mr-2" />
                        Erfolge
                    </h1>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div id="achievements-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <Link
                            href={`/achievements/${badge.id}`}
                            key={badge.id}
                            className={`block bg-white rounded-xl shadow-sm border-2 p-4 transition-all hover:shadow-md hover:scale-[1.02] ${badge.isEarned
                                ? 'border-purple-200 bg-purple-50'
                                : 'border-gray-100 opacity-70 grayscale'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${badge.isEarned ? 'bg-purple-100' : 'bg-gray-100'
                                    }`}>
                                    {/* Icon Logic */}
                                    {(badge as any).iconUrl && ((badge as any).iconUrl.startsWith('http') || (badge as any).iconUrl.startsWith('/')) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={(badge as any).iconUrl}
                                            alt={getTitle(badge.title)}
                                            className={`w-8 h-8 object-contain ${!badge.isEarned && 'grayscale opacity-50'}`}
                                        />
                                    ) : (badge as any).iconUrl ? (
                                        <span className={`text-2xl ${!badge.isEarned && 'grayscale opacity-50 filter'}`} role="img" aria-label={getTitle(badge.title)}>
                                            {(badge as any).iconUrl}
                                        </span>
                                    ) : (
                                        badge.isEarned ? (
                                            <TrophyIconSolid className="w-6 h-6 text-purple-600" />
                                        ) : (
                                            <LockClosedIcon className="w-6 h-6 text-gray-400" />
                                        )
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${badge.isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {getTitle(badge.title)}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {getDescription(badge.description)}
                                    </p>
                                    {badge.isEarned && (
                                        <p className="text-xs text-purple-600 mt-2 font-medium">
                                            Freigeschaltet am {new Date(badge.earnedAt!).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
