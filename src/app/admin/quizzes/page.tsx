"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Quiz {
    id: string
    title: any
    lesson: {
        title: any
        chapter: {
            course: {
                title: any
            }
        }
    }
    isPublished: boolean
    _count: {
        questions: number
    }
}

export default function QuizzesAdmin() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchQuizzes()
    }, [])

    const fetchQuizzes = async () => {
        try {
            const res = await fetch('/api/admin/quizzes')
            if (res.ok) {
                const data = await res.json()
                setQuizzes(data)
            }
        } catch (error) {
            console.error('Failed to fetch quizzes', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return

        try {
            const res = await fetch(`/api/admin/quizzes/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchQuizzes()
            }
        } catch (error) {
            console.error('Error deleting quiz', error)
        }
    }

    const getTitle = (title: any) => title?.en || title?.de || 'Untitled'

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
                <Link
                    href="/admin/quizzes/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create New Quiz
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {quizzes.map((quiz) => (
                        <li key={quiz.id}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-blue-600 truncate">{getTitle(quiz.title)}</h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {getTitle(quiz.lesson.chapter.course.title)} / {getTitle(quiz.lesson.title)}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quiz.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {quiz.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {quiz._count.questions} questions
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <Link
                                        href={`/admin/quizzes/${quiz.id}`}
                                        className="p-2 text-gray-400 hover:text-gray-500"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(quiz.id)}
                                        className="p-2 text-red-400 hover:text-red-500"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {quizzes.length === 0 && (
                        <li className="px-4 py-12 text-center text-gray-500">
                            No quizzes found. Create one to get started.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
