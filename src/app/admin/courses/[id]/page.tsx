"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { CourseTree } from '@/components/admin/course-tree'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { LanguageTabs } from '@/components/admin/language-tabs'
import { getLanguages } from '@/lib/translations'

export default function EditCoursePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [dialects, setDialects] = useState<any[]>([])

    const fetchCourse = async () => {
        try {
            const [langs, courseRes, settingsRes] = await Promise.all([
                getLanguages(),
                fetch(`/api/admin/courses/${params.id}`),
                fetch('/api/admin/settings')
            ])

            setLanguages(langs)

            if (settingsRes.ok) {
                const settings = await settingsRes.json()
                if (settings.supported_dialects) {
                    setDialects(settings.supported_dialects)
                } else {
                    setDialects([
                        { code: 'standard', label: 'Standard' },
                        { code: 'zazaki-dimli', label: 'Dersim' }
                    ])
                }
            }

            if (courseRes.ok) {
                const data = await courseRes.json()
                // Init empty keys if missing
                const preparedTitle = data.title || {}
                langs.forEach(l => {
                    if (!preparedTitle[l.code]) preparedTitle[l.code] = ''
                })
                setCourse({ ...data, title: preparedTitle })
            } else {
                alert('Failed to load course')
                router.push('/admin/courses')
            }
        } catch (error) {
            console.error('Error loading course:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourse()
    }, [])


    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await fetch(`/api/admin/courses/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(course)
            })
            alert('Course updated!')
        } catch (error) {
            console.error('Update failed:', error)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!course) return <div className="p-8">Course not found</div>

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => router.push('/admin/courses')}
                className="mb-6 flex items-center text-gray-500 hover:text-gray-700"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Courses
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Course Metadata */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                        <h2 className="text-xl font-bold mb-4">Course Settings</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dialect/Category</label>
                                <select
                                    value={course.dialectCode || 'standard'}
                                    onChange={e => setCourse({ ...course, dialectCode: e.target.value })}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                >
                                    {dialects.length > 0 ? dialects.map(d => (
                                        <option key={d.code} value={d.code}>{d.label}</option>
                                    )) : (
                                        <>
                                            <option value="standard">Standard</option>
                                            <option value="zazaki-dimli">Dersim</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Level</label>
                                <select
                                    value={course.level}
                                    onChange={e => setCourse({ ...course, level: e.target.value })}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                >
                                    {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            {languages.length > 0 && (
                                <LanguageTabs languages={languages}>
                                    {(lang) => (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Title ({languages.find(l => l.code === lang)?.name || lang})
                                            </label>
                                            <input
                                                type="text"
                                                required={lang === 'de'}
                                                value={course.title[lang] || ''}
                                                onChange={e => setCourse({
                                                    ...course,
                                                    title: { ...course.title, [lang]: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                            />
                                        </div>
                                    )}
                                </LanguageTabs>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={course.isPublished}
                                    onChange={e => setCourse({ ...course, isPublished: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">Published</label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Update Course
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Hierarchy Tree */}
                <div className="lg:col-span-2">
                    <CourseTree
                        courseId={course.id}
                        chapters={course.chapters || []}
                        onUpdate={fetchCourse}
                    />
                </div>
            </div>
        </div>
    )
}
