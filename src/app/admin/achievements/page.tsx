"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilSquareIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'

interface Badge {
    id: string
    code: string
    title: any
    description: any
    iconUrl: string | null
    imageUrl?: string | null
    isActive: boolean
    sortOrder?: number
    criteria?: any
    conditionLabel?: any
}

export default function AchievementsAdmin() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [badges, setBadges] = useState<Badge[]>([])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBadges()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, statusFilter])

    const fetchBadges = async () => {
        try {
            console.log('Fetching badges...')
            setError(null)
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active' ? 'true' : 'false')

            const res = await fetch(`/api/admin/badges?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                console.log('Badges fetched (raw):', data)
                if (Array.isArray(data)) {
                    console.log('Setting badges state with length:', data.length)
                    setBadges(data)
                } else {
                    console.error('Data is not an array:', data)
                    setError('Received invalid data format')
                }
            } else {
                const err = await res.json()
                console.error('Fetch failed:', err)
                setError(err.details || 'Failed to fetch badges')
            }
        } catch (error) {
            console.error('Failed to fetch badges', error)
            setError('Network error occurred')
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

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newBadges = [...badges]
        if (direction === 'up') {
            if (index === 0) return
            [newBadges[index - 1], newBadges[index]] = [newBadges[index], newBadges[index - 1]]
        } else {
            if (index === newBadges.length - 1) return
            [newBadges[index + 1], newBadges[index]] = [newBadges[index], newBadges[index + 1]]
        }

        setBadges(newBadges) // Optimistic update
        await saveOrder(newBadges)
    }

    const saveOrder = async (orderedBadges: Badge[]) => {
        try {
            const items = orderedBadges.map((b, index) => ({ id: b.id, sortOrder: index }))
            await fetch('/api/admin/badges/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            })
        } catch (error) {
            console.error('Failed to save order', error)
            // Ideally revert state here on error
        }
    }

    const getTitle = (title: any) => title?.en || title?.de || 'Untitled'

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <AdminPage>
            <AdminPageHeader
                title="Achievements Management"
                actions={
                    <Link
                        href="/admin/achievements/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create New Badge
                    </Link>
                }
            />

            <AdminPageContent>

                {/* Filters */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white p-4 rounded-md shadow mb-6 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full text-black">
                        <input
                            type="text"
                            placeholder="Search badges by title or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border p-2"
                        />
                    </div>
                    <div className="w-full sm:w-auto text-black">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border p-2"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {badges.map((badge, index) => (
                            <li key={badge.id}>
                                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                    <div className="flex items-center">
                                        <div className="flex flex-col mr-4 space-y-1">
                                            <button
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronUpIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === badges.length - 1}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDownIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-2xl mr-4 flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                            {badge.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={badge.imageUrl} alt="icon" className="w-10 h-10 object-cover rounded-full" />
                                            ) : (
                                                badge.iconUrl || '🏆'
                                            )}
                                        </span>
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
            </AdminPageContent>
        </AdminPage>
    )
}
