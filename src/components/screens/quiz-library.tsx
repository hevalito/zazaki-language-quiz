"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QuizCard } from '@/components/library/quiz-card'
import { FilterBar } from '@/components/library/filter-bar'
import { BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export function QuizLibrary() {
    const router = useRouter()
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentCourseId, setCurrentCourseId] = useState('')
    const [currentStatus, setCurrentStatus] = useState('')

    useEffect(() => {
        fetchQuizzes()
    }, [currentCourseId, currentStatus])

    const fetchQuizzes = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (currentCourseId) params.append('courseId', currentCourseId)
            if (currentStatus) params.append('status', currentStatus)

            const response = await fetch(`/api/quizzes?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setQuizzes(data)
            } else {
                console.error('Failed to fetch quizzes')
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartQuiz = (id: string) => {
        router.push(`/quiz/${id}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Zurück"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Bibliothek</h1>
                            <p className="text-sm text-gray-500">Entdecke und lerne</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {/* Filters */}
                <FilterBar
                    currentCourseId={currentCourseId}
                    currentStatus={currentStatus}
                    onCourseChange={setCurrentCourseId}
                    onStatusChange={setCurrentStatus}
                />

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onStart={handleStartQuiz}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpenIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Keine Quiz gefunden</h3>
                        <p className="text-gray-500 mt-2">Versuche es mit anderen Filtern.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
