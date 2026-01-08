"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuizCard } from '@/components/library/quiz-card'
import { FilterBar } from '@/components/library/filter-bar'
import { BookOpenIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'


import { useTranslation } from '@/hooks/use-translation'

export function QuizLibrary() {
    const { t } = useTranslation()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Derive state from URL - URL is the source of truth
    const currentCourseId = searchParams.get('tab') || ''
    const currentStatus = searchParams.get('status') || ''

    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchQuizzes()
    }, [searchParams])

    const updateFilter = (type: 'tab' | 'status', value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(type, value)
        } else {
            params.delete(type)
        }
        router.push(`/library?${params.toString()}`)
    }

    const fetchQuizzes = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            // Map tab to API params
            if (currentCourseId === 'daily') {
                params.append('type', 'DAILY')
            } else if (currentCourseId) {
                params.append('courseId', currentCourseId)
            }

            if (currentStatus) {
                params.append('status', currentStatus)
            }

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

    const filteredQuizzes = quizzes.filter(quiz => {
        if (!searchQuery) return true
        const term = searchQuery.toLowerCase()

        // Check titles (de/en)
        const titleDE = (quiz.title?.de || '').toLowerCase()
        const titleEN = (quiz.title?.en || '').toLowerCase()

        // Check descriptions (de/en)
        const descDE = (quiz.description?.de || '').toLowerCase()
        const descEN = (quiz.description?.en || '').toLowerCase()

        return titleDE.includes(term) || titleEN.includes(term) || descDE.includes(term) || descEN.includes(term)
    })

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
                            aria-label={t('nav.back', 'Zurück')}
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('library.title', 'Bibliothek')}</h1>
                            <p className="text-sm text-gray-500">{t('library.subtitle', 'Entdecke und lerne')}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {/* Search */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('library.search.placeholder', 'Suche nach Quizzen...')}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <FilterBar
                    currentCourseId={currentCourseId}
                    currentStatus={currentStatus}
                    onCourseChange={(id) => updateFilter('tab', id)}
                    onStatusChange={(status) => updateFilter('status', status)}
                />

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
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
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{t('library.empty.title', 'Keine Quizze gefunden')}</h3>
                        <p className="text-gray-500 mt-2">{t('library.empty.desc', 'Versuche es mit einem anderen Suchbegriff oder Filter.')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
