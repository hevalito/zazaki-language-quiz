"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BadgeFormProps {
    initialData?: any
    isEditing?: boolean
}

export function BadgeForm({ initialData, isEditing = false }: BadgeFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        title: {
            en: initialData?.title?.en || '',
            de: initialData?.title?.de || ''
        },
        description: {
            en: initialData?.description?.en || '',
            de: initialData?.description?.de || ''
        },
        iconUrl: initialData?.iconUrl || '',
        criteriaType: initialData?.criteria?.type || 'lesson_completion',
        criteriaValue: initialData?.criteria?.level || initialData?.criteria?.value || initialData?.criteria?.count || 1,
        isActive: initialData?.isActive ?? true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                code: formData.code,
                title: formData.title,
                description: formData.description,
                iconUrl: formData.iconUrl,
                criteria: formData.criteriaType === 'level_reached'
                    ? { type: 'level_reached', level: formData.criteriaValue }
                    : { type: formData.criteriaType, count: Number(formData.criteriaValue) },
                isActive: formData.isActive
            }

            const url = isEditing
                ? `/api/admin/badges/${initialData.id}`
                : '/api/admin/badges'

            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                router.push('/admin/achievements')
                router.refresh()
            } else {
                alert('Something went wrong')
            }
        } catch (error) {
            console.error(error)
            alert('Error saving badge')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                {/* Code */}
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Code (Unique ID)</label>
                    <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>

                {/* Icon URL */}
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Icon Emoji/URL</label>
                    <input
                        type="text"
                        value={formData.iconUrl}
                        onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        placeholder="🏆"
                    />
                </div>

                {/* English Title */}
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Title (EN)</label>
                    <input
                        type="text"
                        required
                        value={formData.title.en}
                        onChange={e => setFormData({
                            ...formData,
                            title: { ...formData.title, en: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>

                {/* German Title */}
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Title (DE)</label>
                    <input
                        type="text"
                        required
                        value={formData.title.de}
                        onChange={e => setFormData({
                            ...formData,
                            title: { ...formData.title, de: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>

                {/* English Description */}
                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Description (EN)</label>
                    <textarea
                        rows={2}
                        value={formData.description.en}
                        onChange={e => setFormData({
                            ...formData,
                            description: { ...formData.description, en: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>

                {/* German Description */}
                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Description (DE)</label>
                    <textarea
                        rows={2}
                        value={formData.description.de}
                        onChange={e => setFormData({
                            ...formData,
                            description: { ...formData.description, de: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>

                {/* Criteria Type */}
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Criteria Type</label>
                    <select
                        value={formData.criteriaType}
                        onChange={e => setFormData({ ...formData, criteriaType: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="lesson_completion">Lesson Completion</option>
                        <option value="streak">Streak</option>
                        <option value="total_xp">Total XP</option>
                        <option value="level_reached">Level Reached</option>
                        <option value="total_quizzes">Total Quizzes</option>
                        <option value="perfect_score_streak">Perfect Score Streak</option>
                    </select>
                </div>

                {/* Criteria Value */}
                {formData.criteriaType === 'level_reached' ? (
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Required Level</label>
                        <select
                            value={formData.criteriaValue} // We'll store string 'A1' etc here temporarily, cast safely later
                            onChange={e => setFormData({ ...formData, criteriaValue: e.target.value as any })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                            <option value="A1">A1 - Beginner</option>
                            <option value="A2">A2 - Elementary</option>
                            <option value="B1">B1 - Intermediate</option>
                            <option value="B2">B2 - Upper Intermediate</option>
                            <option value="C1">C1 - Advanced</option>
                            <option value="C2">C2 - Mastery</option>
                        </select>
                    </div>
                ) : (
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                            {formData.criteriaType === 'total_xp' ? 'XP Needed' :
                                formData.criteriaType === 'streak' ? 'Days Streak' :
                                    formData.criteriaType === 'total_quizzes' ? 'Quizzes Count' :
                                        formData.criteriaType === 'perfect_score_streak' ? 'Streak Count' :
                                            'Count'}
                        </label>
                        <input
                            type="number"
                            value={formData.criteriaValue}
                            onChange={e => setFormData({ ...formData, criteriaValue: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                    </div>
                )}

                {/* Active Status */}
                <div className="sm:col-span-6">
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isActive" className="font-medium text-gray-700">Active</label>
                            <p className="text-gray-500">Users can earn this badge.</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Badge'}
                </button>
            </div>
        </form>
    )
}
