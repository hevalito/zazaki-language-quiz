"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    TrophyIcon,
    ArrowLeftIcon,
    UserCircleIcon,
    FireIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/use-translation'

// ...

export default function LeaderboardPage() {
    const { t } = useTranslation()
    const router = useRouter()
    // ...

    // ... (fetchLeaderboard) ...

    // ... (getRankStyle) ...

    // ... (getRankIcon) ...

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={t('nav.back', 'Zurück')}
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <TrophyIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('leaderboard.title', 'Bestenliste')}</h1>
                            <p className="text-sm text-gray-500">{t('leaderboard.subtitle', 'Erklimme die Spitze')}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4">
                    <div className="flex space-x-1 border-b border-gray-200">
                        <button
                            onClick={() => setTimeFrame('weekly')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${timeFrame === 'weekly'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('leaderboard.weekly', 'Diese Woche')}
                        </button>
                        <button
                            onClick={() => setTimeFrame('all_time')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${timeFrame === 'all_time'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('leaderboard.allTime', 'All Time')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-2xl safe-area-bottom">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <TrophyIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{t('leaderboard.empty', 'Noch keine Einträge für diesen Zeitraum.')}</p>
                    </div>
                ) : (
                    <div className="space-y-3" id="leaderboard-list">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className={`
                    flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all
                    ${entry.isCurrentUser ? 'ring-2 ring-primary-500 border-primary-200 bg-primary-50' : 'bg-white border-gray-200'}
                  `}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getRankStyle(entry.rank)}`}>
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                            {entry.image ? (
                                                <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircleIcon className="w-full h-full text-gray-400 p-1" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${entry.isCurrentUser ? 'text-primary-900' : 'text-gray-900'}`}>
                                                {entry.name} {entry.isCurrentUser && t('leaderboard.you', '(Du)')}
                                            </p>
                                            {/* <p className="text-xs text-gray-500">Level 5</p> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={`font-bold ${entry.isCurrentUser ? 'text-primary-700' : 'text-gray-700'}`}>
                                        {entry.xp} XP
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
