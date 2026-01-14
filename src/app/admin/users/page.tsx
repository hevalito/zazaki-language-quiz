
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'
import { useTranslation } from '@/hooks/use-translation'

type User = {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    isAdmin: boolean
    nickname: string | null
    createdAt: string
    lastActiveDate: string | null
    totalXP: number
    currentLevel: string
    dailyGoal: number
    courseFinderData: any
    _count?: {
        pushSubscriptions: number
    }
}

export default function AdminUsersPage() {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL')
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const queryClient = useQueryClient()

    // Fetch Users
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users', search, roleFilter],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.append('q', search)
            const res = await fetch(`/api/admin/users?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch users')
            let data = await res.json() as User[]

            // Client side filtering for role (since API doesn't support it yet, optional optimization)
            if (roleFilter === 'ADMIN') data = data.filter(u => u.isAdmin)
            if (roleFilter === 'STUDENT') data = data.filter(u => !u.isAdmin)

            return data
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
        if (confirm(`Are you sure you want to delete ${getUserDisplayName(user)}? This action cannot be undone.`)) {
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
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                nickname: editingUser.nickname,
                dailyGoal: editingUser.dailyGoal,
                isAdmin: editingUser.isAdmin,
            },
        })
    }

    // Helper to get smart display name
    const getUserDisplayName = (user: User) => {
        if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
        if (user.firstName) return user.firstName
        if (user.nickname) return user.nickname
        if (user.name) return user.name
        return user.email || 'No Name'
    }

    return (
        <AdminPage>
            <AdminPageHeader
                title="User Management"
            />

            <AdminPageContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admins</option>
                            <option value="STUDENT">Students</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Activity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))
                            ) : users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-gray-500">
                                        No users found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users?.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                                    {user.image ? (
                                                        <Image src={user.image} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                            <span className="text-xl font-bold">{getUserDisplayName(user)[0].toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {getUserDisplayName(user)}
                                                        {(user._count?.pushSubscriptions ?? 0) > 0 && (
                                                            <span className="ml-2 text-primary-600 dark:text-primary-400" title="Web Push Enabled">
                                                                <BellIcon className="w-4 h-4 inline" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                }`}
                                            >
                                                {user.isAdmin ? 'Admin' : 'Student'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-900 dark:text-gray-100">Level {user.currentLevel || 'A1'}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.totalXP || 0} XP</div>
                                            {/* @ts-ignore */}
                                            {user.courseFinderData?.result?.dialect && (
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                        {/* @ts-ignore */}
                                                        {t(user.courseFinderData.result.dialect)}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-900 dark:text-gray-100">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Last Active: {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'Never'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4"
                                                title="Edit User"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(user)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                title="Delete User"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </AdminPageContent>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-gray-500/75 dark:bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-auto shadow-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit User: {editingUser.email}</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.firstName || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.lastName || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nickname</label>
                                    <input
                                        type="text"
                                        value={editingUser.nickname || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, nickname: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Daily Goal (XP)</label>
                                    <input
                                        type="number"
                                        value={editingUser.dailyGoal || 100}
                                        onChange={(e) => setEditingUser({ ...editingUser, dailyGoal: parseInt(e.target.value) })}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <input
                                        id="isAdmin"
                                        type="checkbox"
                                        checked={editingUser.isAdmin}
                                        onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isAdmin" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Administrator Privileges
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">Grants full access to this dashboard, course editor, and user management.</p>
                            </div>

                            {/* Read-Only Stats */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700">
                                    <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Total XP</span>
                                    <span className="font-mono text-lg text-gray-900 dark:text-gray-100">{editingUser.totalXP}</span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700">
                                    <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Current Level</span>
                                    <span className="font-mono text-lg text-gray-900 dark:text-gray-100">{editingUser.currentLevel}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
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
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">Danger Zone</h4>
                            <ResetUserBadgesButton userId={editingUser.id} />
                        </div>
                    </div>
                </div>
            )
            }
        </AdminPage>
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
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 dark:border-red-900/50 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
            {loading ? 'Resetting...' : 'Reset User Achievements'}
        </button>
    )
}
