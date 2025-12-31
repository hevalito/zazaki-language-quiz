"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Badge {
    id: string
    code: string
    title: any
    description: any
    iconUrl: string
    isActive: boolean
}

export default function AchievementsAdmin() {
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBadges()
    }, [])

    const fetchBadges = async () => {
        try {
            const res = await fetch('/api/admin/badges')
            if (res.ok) {
                const data = await res.json()
                setBadges(data)
            }
        } catch (error) {
            console.error('Failed to fetch badges', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this badge?')) return

        try {
            const res = await fetch(`/api/admin/badges/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchBadges()
            }
        } catch (error) {
            console.error('Error deleting badge', error)
        }
    }

    const getTitle = (title: any) => title?.en || title?.de || 'Untitled'

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Achievements Management</h1>
                <Link
                    href="/admin/achievements/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create New Badge
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {badges.map((badge) => (
                        <li key={badge.id}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-4">{badge.iconUrl || '🏆'}</span>
                                    <div>
                                        <h3 className="text-lg font-medium text-blue-600 truncate">{getTitle(badge.title)}</h3>
                                        <p className="text-sm text-gray-500">Code: {badge.code}</p>
                                        <div className="mt-1 flex items-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {badge.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href={`/admin/achievements/${badge.id}`}
                                        className="p-2 text-gray-400 hover:text-gray-500"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(badge.id)}
                                        className="p-2 text-red-400 hover:text-red-500"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {badges.length === 0 && (
                        <li className="px-4 py-12 text-center text-gray-500">
                            No badges found. Create one to get started.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
