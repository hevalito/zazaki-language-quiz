
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

type User = {
    id: string
    name: string | null
    email: string | null
    image: string | null
    isAdmin: boolean
    nickname: string | null
    createdAt: string
    totalXP: number
    currentLevel: string
    _count?: {
        pushSubscriptions: number
    }
}

export default function AdminUsersPage() {
    const [search, setSearch] = useState('')
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const queryClient = useQueryClient()

    // Fetch Users
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users', search],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.append('q', search)
            const res = await fetch(`/api/admin/users?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch users')
            return res.json() as Promise<User[]>
        },
    })

    // Update User Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Failed to update user')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            setEditingUser(null)
        },
    })

    // Delete User Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            })
            if (!res.ok) throw new Error('Failed to delete user')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
    })

    const confirmDelete = (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`)) {
            deleteMutation.mutate(user.id)
        }
    }

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        updateMutation.mutate({
            id: editingUser.id,
            data: {
                name: editingUser.name,
                nickname: editingUser.nickname,
                isAdmin: editingUser.isAdmin,
            },
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search by name, email, or nickname..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : users?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            users?.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100">
                                                {user.image ? (
                                                    <Image src={user.image} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                        <span className="text-xl font-bold">{user.name?.[0] || user.email?.[0]?.toUpperCase()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name || 'No Name'}
                                                    {user.nickname && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">@{user.nickname}</span>}
                                                    {(user._count?.pushSubscriptions ?? 0) > 0 && (
                                                        <span className="ml-2 text-primary-600" title="Web Push Enabled">
                                                            <BellIcon className="w-4 h-4 inline" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => updateMutation.mutate({ id: user.id, data: { isAdmin: !user.isAdmin } })}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${user.isAdmin
                                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                }`}
                                        >
                                            {user.isAdmin ? 'Admin' : 'Student'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">Level {user.currentLevel || 'A1'}</div>
                                        <div className="text-sm text-gray-500">{user.totalXP || 0} XP</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-primary-600 hover:text-primary-900 mr-4"
                                            title="Edit User"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(user)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete User"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                                <input
                                    type="text"
                                    value={editingUser.name || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nickname</label>
                                <input
                                    type="text"
                                    value={editingUser.nickname || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, nickname: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="isAdmin"
                                    type="checkbox"
                                    checked={editingUser.isAdmin}
                                    onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                                    Administrator Privileges
                                </label>
                            </div>

                            <div className="mt-5 sm:mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>

                        {/* Danger Zone */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-red-600 mb-4">Danger Zone</h4>
                            <ResetUserBadgesButton userId={editingUser.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
function ResetUserBadgesButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false)

    const handleReset = async () => {
        if (!confirm('Are you sure? This will delete all achievements for this user.')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${userId}/reset-badges`, {
                method: 'POST'
            })
            if (res.ok) {
                alert('Achievements reset successfully')
            } else {
                alert('Failed to reset achievements')
            }
        } catch (error) {
            console.error(error)
            alert('Error resetting achievements')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            {loading ? 'Resetting...' : 'Reset User Achievements'}
        </button>
    )
}
