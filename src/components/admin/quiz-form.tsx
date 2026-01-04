"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface QuizFormProps {
    initialData?: any
    isEditing?: boolean
}

interface Lesson {
    id: string
    title: any
    chapter: {
        title: any
        course: {
            title: any
        }
    }
}

export function QuizForm({ initialData, isEditing = false }: QuizFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [formData, setFormData] = useState({
        title: {
            en: initialData?.title?.en || '',
            de: initialData?.title?.de || ''
        },
        description: {
            en: initialData?.description?.en || '',
            de: initialData?.description?.de || ''
        },
        lessonId: initialData?.lessonId || '',
        order: initialData?.order || 0,
        isPublished: initialData?.isPublished ?? false,
        randomizeQuestions: (initialData?.config as any)?.randomize ?? false
    })

    useEffect(() => {
        const fetchLessons = async () => {
            const res = await fetch('/api/admin/lessons')
            if (res.ok) {
                const data = await res.json()
                setLessons(data)
            }
        }
        fetchLessons()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                lessonId: formData.lessonId,
                order: Number(formData.order),
                isPublished: formData.isPublished,
                config: {
                    randomize: formData.randomizeQuestions
                }
            }

            const url = isEditing
                ? `/api/admin/quizzes/${initialData.id}`
                : '/api/admin/quizzes'

            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                router.push('/admin/quizzes')
                router.refresh()
            } else {
                alert('Something went wrong')
            }
        } catch (error) {
            console.error(error)
            alert('Error saving quiz')
        } finally {
            setLoading(false)
        }
    }

    const getTitle = (title: any) => title?.en || title?.de || 'Untitled'

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                {/* Lesson Select */}
                <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Lesson</label>
                    <select
                        required
                        value={formData.lessonId}
                        onChange={e => setFormData({ ...formData, lessonId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="">Select a Lesson</option>
                        {lessons.map(lesson => (
                            <option key={lesson.id} value={lesson.id}>
                                {getTitle(lesson.chapter.course.title)} - {getTitle(lesson.chapter.title)} - {getTitle(lesson.title)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Order */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
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

                {/* Published Status */}
                <div className="sm:col-span-6 space-y-4">
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="isPublished"
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isPublished" className="font-medium text-gray-700">Published</label>
                            <p className="text-gray-500">Visible to users in the app.</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="randomizeQuestions"
                                type="checkbox"
                                checked={formData.randomizeQuestions}
                                onChange={e => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="randomizeQuestions" className="font-medium text-gray-700">Randomize Questions</label>
                            <p className="text-gray-500">Shuffle questions every time a user plays this quiz.</p>
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
                    {loading ? 'Saving...' : 'Save Quiz'}
                </button>
            </div>
        </form>
    )
}
