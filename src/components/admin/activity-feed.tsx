"use client"

import { useState, useEffect } from 'react'
import {
    ClockIcon,
    AcademicCapIcon,
    CheckCircleIcon,
    TrophyIcon,
    FireIcon,
    UserIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'QUIZ_COMPLETED': return <CheckCircleIcon className="w-5 h-5 text-green-600" />
            case 'LEARNING_PRACTICE': return <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
            case 'BADGE_EARNED': return <TrophyIcon className="w-5 h-5 text-yellow-600" />
            case 'STREAK_FROZEN': return <FireIcon className="w-5 h-5 text-orange-600" />
            case 'SIGN_IN': return <UserIcon className="w-5 h-5 text-blue-600" />
            default: return <ClockIcon className="w-5 h-5 text-gray-400" />
        }
    }

    const getActivityContent = (activity: Activity) => {
        const { type, metadata } = activity
        switch (type) {
            case 'QUIZ_COMPLETED':
                return (
                    <div>
                        <span className="font-medium text-gray-900">completed a quiz</span>
                        <div className="text-sm text-gray-600 mt-0.5">
                            "{metadata?.quizTitle || 'Unknown Quiz'}" • {metadata?.score} XP ({metadata?.percentage}%)
                        </div>
                    </div>
                )
            case 'LEARNING_PRACTICE':
                return (
                    <div>
                        <span className="font-medium text-gray-900">practiced in Learning Room</span>
                        <div className="text-sm text-gray-600 mt-0.5">
                            {metadata?.isCorrect ? 'Correctly answered' : 'Missed'} a question
                            {metadata?.questionType && <span className="text-gray-400"> ({metadata.questionType})</span>}
                        </div>
                    </div>
                )
            case 'BADGE_EARNED':
                return (
                    <div>
                        <span className="font-medium text-gray-900">earned a badge!</span>
                        <div className="text-sm text-yellow-600 mt-0.5 font-medium">
                            🏆 {metadata?.badgeTitle || 'Unknown Badge'}
                        </div>
                    </div>
                )
            case 'STREAK_FROZEN':
                return (
                    <div>
                        <span className="font-medium text-gray-900">used a Streak Freeze</span>
                        <div className="text-sm text-gray-600 mt-0.5">
                            Kept their streak alive!
                        </div>
                    </div>
                )
            default:
                return (
                    <span className="text-gray-600">performed an action ({type})</span>
                )
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ul role="list" className="divide-y divide-gray-100">
                    {activities.map((activity) => (
                        <li key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            {activity.user.nickname || activity.user.name || activity.user.email}
                                        </div>
                                        {getActivityContent(activity)}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">
                                        {new Date(activity.createdAt).toLocaleString('de-DE')}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {activities.length === 0 && !loading && (
                        <li className="p-8 text-center text-gray-500">
                            No activity found yet.
                        </li>
                    )}
                </ul>
            </div>

            {hasMore && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Loading...
                            </>
                        ) : (
                            'Load More'
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
