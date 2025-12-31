"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { CourseTree } from '@/components/admin/course-tree'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function EditCoursePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourse()
    }, [])

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/admin/courses/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setCourse(data)
            } else {
                alert('Failed to load course')
                router.push('/admin/courses')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

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
                                <label className="block text-sm font-medium text-gray-700">Level</label>
                                <select
                                    value={course.level}
                                    onChange={e => setCourse({ ...course, level: e.target.value })}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                >
                                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title (EN)</label>
                                <input
                                    type="text"
                                    value={course.title?.en || ''}
                                    onChange={e => setCourse({ ...course, title: { ...course.title, en: e.target.value } })}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title (DE)</label>
                                <input
                                    type="text"
                                    value={course.title?.de || ''}
                                    onChange={e => setCourse({ ...course, title: { ...course.title, de: e.target.value } })}
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                />
                            </div>
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
