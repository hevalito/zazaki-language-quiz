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
    status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
    metadata: any
    createdAt: string
    updatedAt: string
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

    // Filters
    const [filterType, setFilterType] = useState<string>('')
    const [filterUser, setFilterUser] = useState<string | null>(null) // UserId

    const fetchActivities = async (pageNum: number, reset = false, background = false) => {
        if (!background) setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', pageNum.toString())
            params.append('limit', '20')
            if (filterType) params.append('type', filterType)
            if (filterUser) params.append('userId', filterUser)

            const res = await fetch(`/api/admin/activity?${params.toString()}`)
            const data = await res.json()

            if (reset) {
                setActivities(data.activities)
            } else {
                setActivities(prev => {
                    // Smart merge? Or just append?
                    // For pagination, append is standard.
                    // For polling (reset=true), we replace.
                    return [...prev, ...data.activities]
                })
            }

            setTotal(data.meta.total)
            setHasMore(data.activities.length === 20)
        } catch (error) {
            console.error(error)
        } finally {
            if (!background) setLoading(false)
        }
    }

    // Initial Load + Filter Changes
    useEffect(() => {
        setPage(1)
        fetchActivities(1, true)
    }, [filterType, filterUser])

    // Polling (Real-time updates)
    useEffect(() => {
        const interval = setInterval(() => {
            // Only poll if on first page to avoid scroll jumps/confusion
            if (page === 1) {
                fetchActivities(1, true, true)
            }
        }, 5000) // 5 seconds
        return () => clearInterval(interval)
    }, [page, filterType, filterUser])

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
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    text: 'text-green-700 dark:text-green-400',
                    border: 'border-green-200 dark:border-green-800'
                }
            case 'LEARNING_PRACTICE':
                return {
                    icon: AcademicCapIcon,
                    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
                    text: 'text-indigo-700 dark:text-indigo-300',
                    border: 'border-indigo-200 dark:border-indigo-800'
                }
            case 'BADGE_EARNED':
                return {
                    icon: TrophyIcon,
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    text: 'text-yellow-700 dark:text-yellow-400',
                    border: 'border-yellow-200 dark:border-yellow-800'
                }
            case 'STREAK_FROZEN':
                return {
                    icon: FireIcon,
                    bg: 'bg-orange-100 dark:bg-orange-900/30',
                    text: 'text-orange-700 dark:text-orange-400',
                    border: 'border-orange-200 dark:border-orange-800'
                }
            case 'SIGN_IN':
                return {
                    icon: UserIcon,
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    text: 'text-blue-700 dark:text-blue-300',
                    border: 'border-blue-200 dark:border-blue-800'
                }
            case 'QUIZ_STARTED':
                return {
                    icon: ClockIcon,
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    text: 'text-yellow-600 dark:text-yellow-400',
                    border: 'border-yellow-100 dark:border-yellow-900/50'
                }
            case 'LEARNING_SESSION_STARTED':
                return {
                    icon: AcademicCapIcon,
                    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                    text: 'text-indigo-600 dark:text-indigo-300',
                    border: 'border-indigo-100 dark:border-indigo-900/50'
                }
            case 'LEVEL_UP':
                return {
                    icon: ChartBarIcon,
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    text: 'text-purple-700 dark:text-purple-300',
                    border: 'border-purple-200 dark:border-purple-800'
                }
            default:
                return {
                    icon: ClockIcon,
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-700 dark:text-gray-300',
                    border: 'border-gray-200 dark:border-gray-700'
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
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 bg-opacity-50 rounded p-2 border border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{getLocalizedText(metadata.quizTitle) || 'Unknown Quiz'}</p>
                        <div className="flex space-x-3 mt-1 text-xs">
                            <span>Score: <b>{metadata.score}</b></span>
                            <span>Points: <b>{metadata.percentage}%</b></span>
                        </div>
                    </div>
                )
            case 'QUIZ_STARTED':
                return (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                        Started quiz: <b>{getLocalizedText(metadata.quizTitle)}</b>...
                    </div>
                )
            case 'LEARNING_SESSION_STARTED':
                return (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/20 rounded p-2 border border-indigo-100 dark:border-indigo-900/50">
                        <p className="font-semibold text-indigo-900 dark:text-indigo-300">Learning Session</p>
                        <div className="flex space-x-3 mt-1 text-xs">
                            <span>Progress: <b>{metadata.answered || 0} / {metadata.totalQuestions || '?'}</b></span>
                            <span>Correct: <b>{metadata.correct || 0}</b></span>
                        </div>
                        <div className="mt-1 h-1 w-full bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500"
                                style={{ width: `${Math.round(((metadata.answered || 0) / (metadata.totalQuestions || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                )
            case 'BADGE_EARNED':
                return (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                        🏆 {getLocalizedText(metadata.badgeTitle) || 'Unknown Badge'}
                    </div>
                )
            case 'LEARNING_PRACTICE':
                return (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {metadata.isCorrect ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">Correctly answered</span>
                        ) : (
                            <span className="text-red-500 dark:text-red-400 font-medium">Missed</span>
                        )}
                        {' '}a <b>{metadata.questionType?.toLowerCase().replace('_', ' ')}</b> question
                    </div>
                )
            case 'LEVEL_UP':
                return (
                    <div className="mt-2 text-sm text-purple-700 dark:text-purple-400 font-medium">
                        Leveled up from {metadata.from} to {metadata.to}! 🎉
                    </div>
                )
            default:
                // Render any extra key-values nicely
                return Object.keys(metadata).length > 0 ? (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-1 rounded">
                        {JSON.stringify(metadata).slice(0, 100)}
                    </div>
                ) : null
        }
    }

    const renderActionText = (type: string) => {
        switch (type) {
            case 'QUIZ_COMPLETED': return 'completed a quiz'
            case 'QUIZ_STARTED': return 'started a quiz'
            case 'LEARNING_SESSION_STARTED': return 'is practicing in Learning Room'
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
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="">All Activity Types</option>
                    <option value="QUIZ_COMPLETED">Quiz Completed</option>
                    <option value="QUIZ_STARTED">Quiz Started</option>
                    <option value="LEARNING_SESSION_STARTED">Learning Session</option>
                    <option value="BADGE_EARNED">Badge Earned</option>
                    <option value="LEVEL_UP">Level Up</option>
                    <option value="SIGN_IN">Sign In</option>
                    <option value="STREAK_FROZEN">Streak Freeze</option>
                </select>

                {filterUser && (
                    <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-md text-sm">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>User: {filterUser.slice(0, 8)}...</span>
                        <button
                            onClick={() => setFilterUser(null)}
                            className="ml-2 bg-transparent hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-1"
                        >
                            <ArrowPathIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <div className="flex-1 text-right text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end">
                    {loading && <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />}
                    <span>Live Updates ({total} total)</span>
                </div>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => {
                    const config = getActivityConfig(activity.type)
                    const Icon = config.icon

                    // Logic for "Live" activities:
                    // Must be 'STARTED' or 'IN_PROGRESS'
                    // AND updated within the last 2 hours. Older than that are likely stale/abandoned.
                    const isStale = (new Date().getTime() - new Date(activity.updatedAt || activity.createdAt).getTime()) > 2 * 60 * 60 * 1000
                    const isLive = !isStale && (activity.status === 'STARTED' || activity.status === 'IN_PROGRESS')

                    return (
                        <div
                            key={activity.id}
                            className={`relative flex items-start space-x-3 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border transition-all hover:shadow-md ${isLive ? 'border-l-4 border-l-green-500 animate-pulse-slow' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
                        >
                            {/* Icon column */}
                            <div className="flex-shrink-0">
                                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${config.bg} ${config.border} border`}>
                                    <Icon className={`h-6 w-6 ${config.text}`} aria-hidden="true" />
                                </span>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <button
                                        onClick={() => setFilterUser(activity.user.id)}
                                        className="text-gray-900 dark:text-gray-100 font-bold hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 text-left"
                                        title="Filter by this user"
                                    >
                                        {activity.user.nickname || activity.user.name || 'User'}
                                    </button>
                                    {' '}
                                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                                        {renderActionText(activity.type)}
                                    </span>
                                    {isLive && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 animate-pulse">
                                            LIVE
                                        </span>
                                    )}
                                    {isStale && (activity.status === 'STARTED' || activity.status === 'IN_PROGRESS') && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400">
                                            ABANDONED
                                        </span>
                                    )}
                                </div>

                                {renderMetadata(activity)}
                            </div>

                            {/* Time */}
                            <div className="flex-shrink-0 text-right text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(activity.updatedAt || activity.createdAt), { addSuffix: true, locale: de })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {loading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start space-x-3 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="rounded-full bg-gray-200 dark:bg-gray-800 h-10 w-10"></div>
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activities.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No activity yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Events will appear here as users interact with the app.</p>
                </div>
            )}

            {hasMore && !loading && activities.length > 0 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMore}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    )
}
