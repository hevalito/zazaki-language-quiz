"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MultipleChoiceQuestion } from '@/components/questions/multiple-choice-question'
import type { Question, Choice, MultiLanguageContent } from '@/types'
import { useTranslation } from '@/hooks/use-translation'
import {
    ArrowLeftIcon,
    AcademicCapIcon,
    CheckIcon,
    BookOpenIcon,
    XMarkIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'

// ...

export default function LearningRoomPage() {
    const { t } = useTranslation()
    const router = useRouter()
    const { data: session } = useSession()

    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [explanation, setExplanation] = useState<any>(null)

    useEffect(() => {
        if (session?.user) {
            fetchQuestions()
        }
    }, [session])

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/api/learning')
            if (res.ok) {
                const data = await res.json()
                // API returns { questions: [], count: number }
                if (Array.isArray(data)) {
                    // Backward compatibility if API changes back
                    setQuestions(data)
                } else {
                    setQuestions(data.questions || [])
                }
            }
        } catch (error) {
            console.error('Failed to fetch learning questions', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (choiceId: string) => {
        if (selectedChoiceId) return // prevent double answer
        setSelectedChoiceId(choiceId)

        const currentQ = questions[currentQuestionIndex] as any
        // Check if choice is correct (assuming choice.isCorrect is available or we validate against server)
        // For security, usually we send answer to server. For now, assuming client-side check if 'isCorrect' is exposed in choices (common in simple quizzes)
        // Or we might need to call an API. Let's check how 'MultipleChoiceQuestion' usually works. 
        // In this app context, choices usually contain isCorrect boolean if not stripped. 

        const selectedChoice = currentQ.choices.find((c: any) => c.id === choiceId)
        const correct = selectedChoice?.isCorrect === true
        setIsCorrect(correct)
        setExplanation(currentQ.explanation)

        // If wrong, maybe we want to re-queue it? Logic for learning room.
        // Usually we just show feedback.

        // Report result to server (to update spaced repetition status)
        fetch('/api/learning/progress', {
            method: 'POST',
            body: JSON.stringify({
                questionId: currentQ.id,
                isCorrect: correct
            })
        })
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedChoiceId(null)
            setIsCorrect(null)
            setExplanation(null)
        } else {
            // Finished all current questions
            // Fetch more or show done? 
            // Usually simpler to just show done screen or refresh.
            // Let's clear questions to show "Done" state
            setQuestions([])
            setLoading(false)
        }
    }

    if (loading && questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('loading.questions', 'Lade Fragen...')}</p>
                </div>
            </div>
        )
    }

    // EMPTY STATE
    if (questions.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header matching Library */}
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
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <AcademicCapIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t('learning.title', 'Lernraum')}</h1>
                                <p className="text-sm text-gray-500">{t('learning.subtitle', 'Trainiere deine Fehler')}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('learning.done.title', 'Alles erledigt!')}</h2>
                        <p className="text-gray-600 mb-8">
                            {t('learning.done.desc', 'Du hast keine offenen Wiederholungen. Super gemacht! Der Lernraum füllt sich automatisch, wenn du in Quizzes Fehler machst.')}
                        </p>
                        <button
                            onClick={() => router.push('/library')}
                            className="btn-primary w-full flex items-center justify-center"
                        >
                            <BookOpenIcon className="w-5 h-5 mr-2" />
                            {t('learning.startNew', 'Neues Quiz starten')}
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header matching Library */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={t('nav.back', 'Zurück')}
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('learning.title', 'Lernraum')}</h1>
                            <p className="text-sm text-gray-500">{t('learning.subtitle', 'Trainiere deine Fehler')}</p>
                        </div>
                    </div>

                    <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                        {questions.length - currentQuestionIndex} {t('learning.remaining', 'verbleibend')}
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-2xl p-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Question Card */}
                    <div className="p-6">
                        {/* Quiz Origin Source */}
                        {/* Quiz Origin Source */}
                        {(currentQuestion as any)?.quiz?.title && (
                            <div className="mb-6 flex justify-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    <BookOpenIcon className="w-3.5 h-3.5 mr-1.5" />
                                    {/* Handle potentially localized title */}
                                    {t('learning.origin', 'Aus:')} {((currentQuestion as any).quiz.title?.de || (currentQuestion as any).quiz.title?.en || (currentQuestion as any).quiz.title || 'Quiz')}
                                </span>
                            </div>
                        )}

                        <MultipleChoiceQuestion
                            question={currentQuestion}
                            choices={currentQuestion.choices || []} // Provide choices from included data
                            onAnswer={handleAnswer}
                            selectedChoiceId={selectedChoiceId || undefined}
                            showResult={isCorrect !== null}
                        />
                    </div>

                    {/* Feedback / Explanation Section */}
                    {isCorrect !== null && (
                        <div className={`p-6 border-t ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-start space-x-4">
                                <div className={`p-2 rounded-full flex-shrink-0 ${isCorrect ? 'bg-green-200' : 'bg-red-200'}`}>
                                    {isCorrect ? (
                                        <CheckIcon className="w-6 h-6 text-green-700" />
                                    ) : (
                                        <XMarkIcon className="w-6 h-6 text-red-700" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                        {isCorrect ? t('feedback.correct', 'Raşt o! - Richtig!') : t('feedback.wrong', 'Çi heyf! - Leider falsch!')}
                                    </h3>

                                    {explanation && (
                                        <div className="mt-3 text-sm text-gray-700 bg-white/50 p-3 rounded-lg border border-black/5">
                                            <p className="font-semibold mb-1">{t('quiz.explanation', 'Erklärung:')}</p>
                                            {/* Helper to extract correct language - reusing logic would be better but fast inline here */}
                                            {typeof explanation === 'string' ? explanation : (explanation.de || explanation.en || '')}
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={nextQuestion}
                                            className={`px-6 py-2.5 rounded-lg font-semibold text-white shadow-sm transition-all text-sm
                                            ${isCorrect
                                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                                    : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                                }
                                        `}
                                        >
                                            {isCorrect ? t('quiz.next', 'Weiter') : t('learning.understood', 'Verstanden & Weiter')} <ArrowRightIcon className="w-4 h-4 inline-block ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hint about Spaced Repetition */}
                <div className="text-center mt-8 text-xs text-gray-400">
                    {t('learning.hint', 'Fragen, die du hier falsch beantwortest, kommen sofort wieder dran.')}
                </div>
            </main>
        </div>
    )
}
