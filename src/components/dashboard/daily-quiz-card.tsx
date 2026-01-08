'use client'

import { useState, useEffect } from 'react'
import {
    SparklesIcon,
    CheckCircleIcon,
    ClockIcon,
    PlayIcon
} from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'


import { useTranslation } from '@/hooks/use-translation'

export function DailyQuizCard() {
    const { t } = useTranslation()
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchStatus()
    }, [])

    useEffect(() => {
        if (status?.nextAvailableAt) {
            const timer = setInterval(() => {
                const now = new Date().getTime()
                const target = new Date(status.nextAvailableAt).getTime()
                const dist = target - now

                if (dist < 0) {
                    setTimeLeft('Ready!')
                    // Refresh if it creates a loop? 
                    // If dist < 0, maybe refresh status?
                    if (dist < -5000) fetchStatus() // Refresh with 5s buffer
                } else {
                    const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((dist % (1000 * 60)) / 1000)
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
                }
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [status])

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/user/daily-quiz')
            if (res.ok) {
                const data = await res.json()
                setStatus(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="card animate-pulse h-32 flex items-center justify-center">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    )

    if (!status) return null

    // State 1: Available & Not Completed
    if (status.available && !status.completed && status.quiz) {
        return (
            <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => router.push(`/quiz/${status.quiz.id}`)}>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                {t('daily.context.title', 'Daily Challenge')}
                            </span>
                            <span className="flex items-center text-xs font-medium text-indigo-100 bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                <SparklesIcon className="w-3 h-3 mr-1 text-yellow-300" />
                                {t('daily.context.bonus', '+XP Bonus')}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold font-serif mb-1">{t('daily.ready.c2a', 'Bereit zu spielen?')}</h3>
                        <p className="text-indigo-100 text-sm">
                            {(t('daily.ready.details', '{count} Fragen • Nur heute') as string).replace('{count}', status.quiz.questionCount)}
                        </p>
                    </div>

                    <button className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayIcon className="w-6 h-6 ml-1" />
                    </button>
                </div>
            </div>
        )
    }

    // State 2: Waiting (Completed or Not Generated)
    return (
        <div className="card bg-gray-50 border-gray-200 opacity-90">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">{t('daily.context.title', 'Daily Challenge')}</span>
                        {status.completed && (
                            <span className="flex items-center text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                <span className="md:hidden">{t('daily.status.completedShort', 'Abgeschlossen')}</span>
                                <span className="hidden md:inline">{t('daily.status.completed', 'Für heute abgeschlossen')}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-gray-400">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        <span className="font-mono text-lg font-medium">{timeLeft || t('daily.status.loading', 'Lade...')}</span>
                        <span className="text-xs ml-2 text-gray-400">{t('daily.status.next', 'bis zum nächsten Quiz')}</span>
                    </div>
                </div>
                {/* History Link? */}
                <div className="text-right">
                    <button
                        onClick={(e) => { e.stopPropagation(); router.push('/library?tab=daily') }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                        {t('daily.archive.link', 'Archiv ansehen')}
                    </button>
                </div>
            </div>
        </div>
    )
}
