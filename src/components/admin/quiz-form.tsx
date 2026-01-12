"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageTabs } from './language-tabs'
import { getLanguages } from '@/lib/translations'
import { translateBatch } from '@/lib/ai-translation'
import { SparklesIcon } from '@heroicons/react/24/outline'

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
    const [languages, setLanguages] = useState<any[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [formData, setFormData] = useState<any>({
        title: {},
        description: {},
        lessonId: initialData?.lessonId || '',
        order: initialData?.order || 0,
        isPublished: initialData?.isPublished ?? false,
        randomizeQuestions: (initialData?.config as any)?.randomize ?? false,
        randomizeAnswers: (initialData?.config as any)?.randomizeAnswers ?? true
    })

    useEffect(() => {
        const load = async () => {
            const [langs, lessonsRes] = await Promise.all([
                getLanguages(),
                fetch('/api/admin/lessons')
            ])

            setLanguages(langs)

            if (lessonsRes.ok) {
                setLessons(await lessonsRes.json())
            }

            // Init dynamic fields
            const initialTitle = initialData?.title || {}
            const initialDesc = initialData?.description || {}
            const preparedTitle: any = {}
            const preparedDesc: any = {}

            langs.forEach(l => {
                preparedTitle[l.code] = initialTitle[l.code] || ''
                preparedDesc[l.code] = initialDesc[l.code] || ''
            })

            setFormData((prev: any) => ({
                ...prev,
                title: preparedTitle,
                description: preparedDesc
            }))
        }
        load()
        load()
    }, [])

    const [translating, setTranslating] = useState(false)

    const handleAutoTranslate = async (targetLang: string) => {
        // Collect source texts (German)
        const itemsToTranslate = []

        const titleDe = formData.title['de']
        if (titleDe && titleDe.trim()) {
            itemsToTranslate.push({ key: 'title', sourceText: titleDe })
        }

        const descDe = formData.description['de']
        if (descDe && descDe.trim()) {
            itemsToTranslate.push({ key: 'description', sourceText: descDe })
        }

        if (itemsToTranslate.length === 0) {
            alert('Please enter German content first.')
            return
        }

        if (!confirm(`Translate fields from German to ${targetLang}? This will overwrite existing ${targetLang} content.`)) {
            return
        }

        setTranslating(true)
        try {
            const targetLangName = languages.find(l => l.code === targetLang)?.name || targetLang
            const results = await translateBatch(itemsToTranslate, targetLangName, 'German')

            // Apply results back to state
            const newFormData = { ...formData }

            if (results['title']) {
                newFormData.title = { ...newFormData.title, [targetLang]: results['title'] }
            }
            if (results['description']) {
                newFormData.description = { ...newFormData.description, [targetLang]: results['description'] }
            }

            setFormData(newFormData)
        } catch (error) {
            console.error(error)
            alert('Translation failed')
        } finally {
            setTranslating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing submit logic)
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
                    randomize: formData.randomizeQuestions,
                    randomizeAnswers: formData.randomizeAnswers
                }
            }
            // ...
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
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 shadow px-4 py-5 sm:rounded-lg sm:p-6 transition-colors">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                {/* Lesson Select */}
                <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lesson</label>
                    <select
                        required
                        value={formData.lessonId}
                        onChange={e => setFormData({ ...formData, lessonId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Language Specific Content */}
                <div className="sm:col-span-6">
                    {languages.length > 0 && (
                        <LanguageTabs languages={languages}>
                            {(lang) => (
                                <div className="space-y-6">
                                    {lang !== 'de' && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleAutoTranslate(lang)}
                                                disabled={translating}
                                                className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
                                            >
                                                {translating ? (
                                                    <span className="mr-1 animate-spin">⏳</span>
                                                ) : (
                                                    <SparklesIcon className="h-4 w-4 mr-1" />
                                                )}
                                                Auto-Translate this tab from German
                                            </button>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Title ({languages.find(l => l.code === lang)?.name || lang})
                                        </label>
                                        <input
                                            type="text"
                                            required={lang === 'de'}
                                            value={formData.title[lang] || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                title: { ...formData.title, [lang]: e.target.value }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description ({languages.find(l => l.code === lang)?.name || lang})
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.description[lang] || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                description: { ...formData.description, [lang]: e.target.value }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            )}
                        </LanguageTabs>
                    )}
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
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isPublished" className="font-medium text-gray-700 dark:text-gray-300">Published</label>
                            <p className="text-gray-500 dark:text-gray-400">Visible to users in the app.</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="randomizeQuestions"
                                type="checkbox"
                                checked={formData.randomizeQuestions}
                                onChange={e => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="randomizeQuestions" className="font-medium text-gray-700 dark:text-gray-300">Randomize Questions</label>
                            <p className="text-gray-500 dark:text-gray-400">Shuffle questions every time a user plays this quiz.</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="randomizeAnswers"
                                type="checkbox"
                                checked={formData.randomizeAnswers}
                                onChange={e => setFormData({ ...formData, randomizeAnswers: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="randomizeAnswers" className="font-medium text-gray-700 dark:text-gray-300">Randomize Answers</label>
                            <p className="text-gray-500 dark:text-gray-400">Shuffle answer options for each question (Default: On).</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => router.push('/admin/quizzes')}
                    className="mr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
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
