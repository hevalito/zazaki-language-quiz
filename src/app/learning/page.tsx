"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MultipleChoiceQuestion } from '@/components/questions/multiple-choice-question'
import type { Question, Choice, MultiLanguageContent } from '@/types'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    XMarkIcon,
    AcademicCapIcon,
    SparklesIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline'

export default function LearningRoomPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // State for the CURRENT question interaction
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [explanation, setExplanation] = useState<MultiLanguageContent | null>(null)
    const [correctChoiceId, setCorrectChoiceId] = useState<string | null>(null)

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/learning')
            if (res.ok) {
                const data = await res.json()
                setQuestions(prev => {
                    return data.questions
                })
                setCurrentQuestionIndex(0)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = async (choiceId: string, _isCorrect?: boolean) => {
        if (submitting || selectedChoiceId) return // Already answered

        setSubmitting(true)
        setSelectedChoiceId(choiceId)

        try {
            const currentQuestion = questions[currentQuestionIndex]
            const res = await fetch('/api/learning/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    choiceId
                })
            })

            const result = await res.json()

            setIsCorrect(result.isCorrect)
            setCorrectChoiceId(result.correctChoiceId)
            setExplanation(result.explanation || currentQuestion.explanation)

        } catch (e) {
            console.error(e)
        } finally {
            setSubmitting(false)
        }
    }

    const nextQuestion = () => {
        // Reset state
        setSelectedChoiceId(null)
        setIsCorrect(null)
        setExplanation(null)
        setCorrectChoiceId(null)

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            // Re-fetch more questions if we reached the end
            fetchQuestions()
        }
    }

    if (loading && questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Lade Fragen...</p>
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
                                aria-label="Zurück"
                            >
                                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                            </button>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <AcademicCapIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Lernraum</h1>
                                <p className="text-sm text-gray-500">Trainiere deine Fehler</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Alles erledigt!</h2>
                        <p className="text-gray-600 mb-8">
                            Du hast keine offenen Wiederholungen. Super gemacht!
                            Der Lernraum füllt sich automatisch, wenn du in Quizzes Fehler machst.
                        </p>
                        <button
                            onClick={() => router.push('/library')}
                            className="btn-primary w-full flex items-center justify-center"
                        >
                            <BookOpenIcon className="w-5 h-5 mr-2" />
                            Neues Quiz starten
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
                            aria-label="Zurück"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Lernraum</h1>
                            <p className="text-sm text-gray-500">Trainiere deine Fehler</p>
                        </div>
                    </div>

                    <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                        {questions.length - currentQuestionIndex} verbleibend
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-2xl p-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Question Card */}
                    <div className="p-6">
                        <MultipleChoiceQuestion
                            question={currentQuestion}
                            choices={currentQuestion.choices || []} // Provide choices from included data
                            onAnswer={handleAnswer}
                            selectedChoiceId={selectedChoiceId || undefined}
                            showResult={isCorrect !== null}
                            userAnswer={selectedChoiceId ? {
                                // Mock basic answer object for display styling
                                questionId: currentQuestion.id,
                                choiceId: selectedChoiceId,
                                isCorrect: isCorrect || false
                            } as any : undefined}
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
                                        {isCorrect ? 'Richtig!' : 'Leider falsch'}
                                    </h3>

                                    {explanation && (
                                        <div className="mt-3 text-sm text-gray-700 bg-white/50 p-3 rounded-lg border border-black/5">
                                            <p className="font-semibold mb-1">Erklärung:</p>
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
                                            {isCorrect ? 'Weiter' : 'Verstanden & Weiter'} <ArrowRightIcon className="w-4 h-4 inline-block ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hint about Spaced Repetition */}
                <div className="text-center mt-8 text-xs text-gray-400">
                    Fragen, die du hier falsch beantwortest, kommen sofort wieder dran.
                </div>
            </main>
        </div>
    )
}
