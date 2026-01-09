"use client"

import { useState, useEffect } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LanguageTabs } from '@/components/admin/language-tabs'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'

import { getLanguages } from '@/lib/translations'

export default function AdminCoursesPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [languages, setLanguages] = useState<any[]>([])
    const [newCourse, setNewCourse] = useState<{
        title: Record<string, string>,
        level: string,
        dialectCode: string,
        description: Record<string, string>
    }>({
        title: {},
        level: 'A1',
        dialectCode: 'standard',
        description: {}
    })

    useEffect(() => {
        const load = async () => {
            const [langs, coursesRes] = await Promise.all([
                getLanguages(),
                fetch('/api/admin/courses')
            ])
            setLanguages(langs)

            if (coursesRes.ok) {
                const data = await coursesRes.json()
                setCourses(data)
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCourse)
            })

            if (res.ok) {
                const created = await res.json()
                setIsCreating(false)
                router.push(`/admin/courses/${created.id}`)
            }
        } catch (error) {
            console.error('Error creating course:', error)
            alert('Failed to create course')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete all chapters and lessons in this course.')) return

        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setCourses(courses.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error('Error deleting course:', error)
            alert('Failed to delete course')
        }
    }


    if (loading) return <div className="p-8">Loading...</div>

    return (
        <AdminPage>
            <AdminPageHeader
                title="Courses"
                description="Manage learning paths and content hierarchy"
                actions={
                    <button
                        onClick={() => {
                            // Initialize with empty strings for all languages
                            const initialTitles: Record<string, string> = {}
                            const initialDescs: Record<string, string> = {}
                            languages.forEach(l => {
                                initialTitles[l.code] = ''
                                initialDescs[l.code] = ''
                            })
                            setNewCourse({
                                title: initialTitles,
                                level: 'A1',
                                description: initialDescs
                            })
                            setIsCreating(true)
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New Course
                    </button>
                }
            />

            <AdminPageContent>
                {isCreating && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="col-span-2">
                                {languages.length > 0 && (
                                    <LanguageTabs languages={languages}>
                                        {(lang) => (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Title ({lang === 'de' ? 'German' : 'English'})
                                                </label>
                                                <input
                                                    type="text"
                                                    required={lang === 'de'}
                                                    value={newCourse.title[lang]}
                                                    onChange={e => setNewCourse({
                                                        ...newCourse,
                                                        title: { ...newCourse.title, [lang]: e.target.value }
                                                    })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                    placeholder={lang === 'de' ? 'Titel eingeben...' : 'Enter title...'}
                                                />
                                            </div>
                                        )}
                                    </LanguageTabs>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Level</label>
                                    <select
                                        value={newCourse.level}
                                        onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    >
                                        {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dialect/Category</label>
                                    <select
                                        value={newCourse.dialectCode}
                                        onChange={e => setNewCourse({ ...newCourse, dialectCode: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="zazaki-dimli">Dersim (zazaki-dimli)</option>
                                        <option value="zazaki-kirmanc">Bingöl (zazaki-kirmanc)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <li key={course.id}>
                                <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-50">
                                    <Link href={`/admin/courses/${course.id}`} className="flex-1 flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {course.level}
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-blue-600 truncate">{course.title?.en} / {course.title?.de}</h3>
                                                <p className="text-sm text-gray-500">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                                        {course.dialectCode || 'standard'}
                                                    </span>
                                                    {course._count?.chapters || 0} Chapters
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="ml-4 flex items-center gap-2">
                                        <Link
                                            href={`/admin/courses/${course.id}`}
                                            className="p-2 text-gray-400 hover:text-gray-500"
                                        >
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {courses.length === 0 && !loading && (
                            <li className="px-4 py-8 text-center text-gray-500">
                                No courses found. Create one to get started.
                            </li>
                        )}
                    </ul>
                </div>
            </AdminPageContent>
        </AdminPage>
    )
}
