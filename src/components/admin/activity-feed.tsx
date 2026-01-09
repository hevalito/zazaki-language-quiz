"use client"

import { useState, useEffect } from 'react'
import {
    ClockIcon,
    AcademicCapIcon,
    CheckCircleIcon,
    TrophyIcon,
    FireIcon,
    UserIcon,
    ArrowPathIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

type Activity = {
    id: string
    type: string
    metadata: any
    createdAt: string
    user: {
        id: string
        name: string | null
        nickname: string | null
        email: string | null
        image: string | null
    }
}

export function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [total, setTotal] = useState(0)

    const fetchActivities = async (pageNum: number, reset = false) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/activity?page=${pageNum}&limit=20`)
            const data = await res.json()

            if (reset) {
                setActivities(data.activities)
            } else {
                setActivities(prev => [...prev, ...data.activities])
            }

            setTotal(data.meta.total)
            setHasMore(data.activities.length === 20)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivities(1, true)
    }, [])

    const loadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchActivities(nextPage)
    }

    const getActivityConfig = (type: string) => {
        switch (type) {
            case 'QUIZ_COMPLETED':
                return {
                    icon: CheckCircleIcon,
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    border: 'border-green-200'
                }
            case 'LEARNING_PRACTICE':
                return {
                    icon: AcademicCapIcon,
                    bg: 'bg-indigo-100',
                    text: 'text-indigo-700',
                    border: 'border-indigo-200'
                }
            case 'BADGE_EARNED':
                return {
                    icon: TrophyIcon,
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200'
                }
            case 'STREAK_FROZEN':
                return {
                    icon: FireIcon,
                    bg: 'bg-orange-100',
                    text: 'text-orange-700',
                    border: 'border-orange-200'
                }
            case 'SIGN_IN':
                return {
                    icon: UserIcon,
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    border: 'border-blue-200'
                }
            case 'LEVEL_UP':
                return {
                    icon: ChartBarIcon,
                    bg: 'bg-purple-100',
                    text: 'text-purple-700',
                    border: 'border-purple-200'
                }
            default:
                return {
                    icon: ClockIcon,
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    border: 'border-gray-200'
                }
        }
    }

    const getLocalizedText = (text: any) => {
        if (!text) return ''
        if (typeof text === 'string') return text
        if (typeof text === 'object') {
            return text['de'] || text['en'] || Object.values(text)[0] || ''
        }
        return ''
    }

    const renderMetadata = (activity: Activity) => {
        const { type, metadata } = activity
        if (!metadata) return null

        switch (type) {
            case 'QUIZ_COMPLETED':
                return (
                    <div className="mt-2 text-sm text-gray-600 bg-white bg-opacity-50 rounded p-2 border border-gray-100">
                        <p className="font-semibold text-gray-900">{getLocalizedText(metadata.quizTitle) || 'Unknown Quiz'}</p>
                        <div className="flex space-x-3 mt-1 text-xs">
                            <span>Score: <b>{metadata.score}</b></span>
                            <span>Points: <b>{metadata.percentage}%</b></span>
                        </div>
                    </div>
                )
            case 'BADGE_EARNED':
                return (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🏆 {getLocalizedText(metadata.badgeTitle) || 'Unknown Badge'}
                    </div>
                )
            case 'LEARNING_PRACTICE':
                return (
                    <div className="mt-1 text-sm text-gray-500">
                        {metadata.isCorrect ? (
                            <span className="text-green-600 font-medium">Correctly answered</span>
                        ) : (
                            <span className="text-red-500 font-medium">Missed</span>
                        )}
                        {' '}a <b>{metadata.questionType?.toLowerCase().replace('_', ' ')}</b> question
                    </div>
                )
            case 'LEVEL_UP':
                return (
                    <div className="mt-2 text-sm text-purple-700 font-medium">
                        Leveled up from {metadata.from} to {metadata.to}! 🎉
                    </div>
                )
            default:
                // Render any extra key-values nicely
                return Object.keys(metadata).length > 0 ? (
                    <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-1 rounded">
                        {JSON.stringify(metadata).slice(0, 100)}
                    </div>
                ) : null
        }
    }

    const renderActionText = (type: string) => {
        switch (type) {
            case 'QUIZ_COMPLETED': return 'completed a quiz'
            case 'LEARNING_PRACTICE': return 'practiced'
            case 'BADGE_EARNED': return 'earned a badge'
            case 'STREAK_FROZEN': return 'used a streak freeze'
            case 'SIGN_IN': return 'signed in'
            case 'LEVEL_UP': return 'reached a new level'
            default: return 'performed an action'
        }
    }

    return (
        <div className="space-y-6">
            {!loading && activities.length > 0 && (
                <div className="text-sm text-gray-500 mb-4 text-right">
                    Total events: {total}
                </div>
            )}

            <div className="space-y-4">
                {activities.map((activity) => {
                    const config = getActivityConfig(activity.type)
                    const Icon = config.icon

                    return (
                        <div
                            key={activity.id}
                            className="relative flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gray-300"
                        >
                            {/* Icon column */}
                            <div className="flex-shrink-0">
                                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${config.bg} ${config.border} border`}>
                                    <Icon className={`h-6 w-6 ${config.text}`} aria-hidden="true" />
                                </span>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                    <span className="text-gray-900 font-bold">
                                        {activity.user.nickname || activity.user.name || 'User'}
                                    </span>
                                    {' '}
                                    <span className="text-gray-500 font-normal">
                                        {renderActionText(activity.type)}
                                    </span>
                                </div>

                                {renderMetadata(activity)}
                            </div>

                            {/* Time */}
                            <div className="flex-shrink-0 text-right text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: de })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {loading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-100">
                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activities.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Events will appear here as users interact with the app.</p>
                </div>
            )}

            {hasMore && !loading && activities.length > 0 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMore}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    )
}
