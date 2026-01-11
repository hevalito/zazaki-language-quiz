"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MultipleChoiceQuestion } from '@/components/questions/multiple-choice-question'
import type { Question } from '@/types'
import { useTranslation } from '@/hooks/use-translation'
import {
    ArrowLeftIcon,
    AcademicCapIcon,
    CheckIcon,
    BookOpenIcon,
    XMarkIcon,
    ArrowRightIcon,
    PlayIcon,
    HomeIcon
} from '@heroicons/react/24/outline'
import { KnowledgeCore } from '@/components/learning/knowledge-core'
import { useMastery } from '@/hooks/use-mastery'

type ViewState = 'loading' | 'start' | 'learning' | 'summary'
import { LearningOnboardingModal } from '@/components/learning/learning-onboarding-modal'

export default function LearningRoomPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const { t } = useTranslation()

    // viewState: loading -> start -> learning -> summary
    const [viewState, setViewState] = useState<'loading' | 'start' | 'learning' | 'summary'>('loading')

    // Onboarding State
    const [showOnboarding, setShowOnboarding] = useState(false)

    // ... (questions state etc)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [explanation, setExplanation] = useState<any>(null)

    const [activityId, setActivityId] = useState<string | null>(null)
    const activityIdRef = useRef<string | null>(null)

    // Global Mastery Hook (Must be at top level)
    const { stats, refresh: refreshStats, isLoading: isMasteryLoading } = useMastery()

    // Initial Load - Check for Active Session
    useEffect(() => {
        if (session?.user) {
            checkActiveSession()

            // Check Onboarding
            const hasSeenOnboarding = localStorage.getItem('zazaki-learning-onboarding-seen')
            if (!hasSeenOnboarding) {
                // Small delay to ensure smooth entrance
                setTimeout(() => setShowOnboarding(true), 500)
            }
        }
    }, [session])

    const handleOnboardingClose = () => {
        setShowOnboarding(false)
        localStorage.setItem('zazaki-learning-onboarding-seen', 'true')
    }

    // Refresh stats when entering summary view
    useEffect(() => {
        if (viewState === 'summary') {
            refreshStats()
        }
    }, [viewState])

    // Cleanup on unmount / navigation
    useEffect(() => {
        return () => {
            const currentActivityId = activityIdRef.current
            // We NO LONGER auto-close on unmount to allow persistence.
            // Only if we wanted to explicit abandon, but "Pause" is better.
            // Keeping the Ref sync just in case we add "Pause" logic later.
        }
    }, [])

    // Sync ref
    useEffect(() => {
        activityIdRef.current = activityId
    }, [activityId])

    // Heartbeat Loop (Optional now since we persist, but good for "Live" status)
    useEffect(() => {
        if (!activityId || viewState !== 'learning') return

        const heartbeat = async () => {
            try {
                await fetch('/api/learning/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activityId })
                })
            } catch (err) {
                console.error('Heartbeat failed', err)
            }
        }

        const interval = setInterval(heartbeat, 30000) // 30s
        return () => clearInterval(interval)
    }, [activityId, viewState])

    const checkActiveSession = async () => {
        try {
            setViewState('loading')
            const res = await fetch('/api/learning') // Default: No action = Check active
            if (res.ok) {
                const data = await res.json()

                // If we get questions back, it means we are RESUMING
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions)
                    setActivityId(data.activityId)
                    setViewState('learning')
                } else {
                    // No active session found (or it was just finished/empty) -> Show START screen
                    setViewState('start')
                }
            } else {
                setViewState('start')
            }
        } catch (error) {
            console.error('Failed to check session', error)
            setViewState('start')
        }
    }

    const startNewSession = async () => {
        try {
            setViewState('loading')
            // Explicitly request NEW session
            const res = await fetch('/api/learning?action=start')
            if (res.ok) {
                const data = await res.json()
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions)
                    setActivityId(data.activityId)
                    setCurrentQuestionIndex(0)
                    // Reset answer state for the first question of the new batch
                    setSelectedChoiceId(null)
                    setIsCorrect(null)
                    setExplanation(null)
                    setViewState('learning')
                } else {
                    // Truly empty (nothing to learn)
                    // If user has 0 total items, showing summary is confusing. Go to start (which will show empty state).
                    if (stats && stats.totalItems === 0) {
                        setViewState('start')
                    } else {
                        setViewState('summary')
                    }
                }
            }
        } catch (error) {
            console.error('Failed to start session', error)
            setViewState('start')
        }
    }

    const handleAnswer = async (choiceId: string) => {
        if (selectedChoiceId) return // prevent double answer
        setSelectedChoiceId(choiceId)

        const currentQ = questions[currentQuestionIndex] as any
        const selectedChoice = currentQ.choices.find((c: any) => c.id === choiceId)
        const correct = selectedChoice?.isCorrect === true
        setIsCorrect(correct)
        setExplanation(currentQ.explanation)

        // Submit to server
        await fetch('/api/learning/submit', {
            method: 'POST',
            body: JSON.stringify({
                questionId: currentQ.id,
                choiceId,
                activityId
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
            finishSession()
        }
    }

    const finishSession = () => {
        // Explicitly close ONLY when done
        if (activityId) {
            fetch('/api/learning/finish', {
                method: 'POST',
                body: JSON.stringify({ activityId }),
                headers: { 'Content-Type': 'application/json' }
            })
            setActivityId(null)
        }
        setViewState('summary')
    }

    // --- RENDER HELPERS ---

    const getContextLabel = (q: any) => {
        if (!q?.quiz) return 'Quiz'

        try {
            // Extract localized string helper
            const extract = (val: any) => {
                if (!val) return ''
                if (typeof val === 'string') return val
                // Prefer active locale if we had it, defaulting to DE/EN
                return val.de || val.en || val.zazaki || ''
            }

            const quizTitle = extract(q.quiz.title)

            // Deep context: Course > Lesson
            if (q.quiz.lesson?.chapter?.course) {
                const courseTitle = extract(q.quiz.lesson.chapter.course.title)
                const lessonTitle = extract(q.quiz.lesson.title)
                return `${courseTitle} • ${lessonTitle}`
            }

            // Fallback for Daily or misc quizzes
            if (q.quiz.type === 'DAILY') {
                return t('learning.daily_context', 'Tägliches Training')
            }

            return quizTitle
        } catch (e) {
            return 'Quiz'
        }
    }

    // --- VIEWS ---

    if (viewState === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('loading.wait', 'Einen Moment...')}</p>
                </div>
            </div>
        )
    }

    // ... imports


    // ... inside component

    // 1. START SCREEN
    if (viewState === 'start') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">{t('learning.title', 'Lernraum')}</h1>
                        </div>
                    </div>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="mb-8 scale-110">
                        <KnowledgeCore
                            percentage={stats?.masteryPercentage || 0}
                            size="xl"
                            animate={true}
                        />
                    </div>

                    <div className="text-center max-w-md mx-auto">
                        {isMasteryLoading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                                <p className="text-gray-500 text-sm">{t('loading.stats', 'Lade Wissensstand...')}</p>
                            </div>
                        ) : stats && stats.totalItems === 0 ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('learning.empty.title', 'Dein Wissensschatz ist leer')}</h2>
                                <p className="text-gray-600 mb-8">
                                    {t('learning.empty.desc', 'Du hast noch keine Vokabeln gesammelt. Mach ein paar Quizze, um deinen Wissensschatz zu füllen!')}
                                </p>
                                <button
                                    onClick={() => router.push('/library')}
                                    className="btn-primary w-full flex items-center justify-center text-lg py-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <BookOpenIcon className="w-6 h-6 mr-2" />
                                    {t('learning.goto_library', 'Zu den Übungen')}
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('learning.start.title', 'Bereit zum Training?')}</h2>
                                <p className="text-gray-600 mb-8">
                                    {t('learning.start.desc', 'Der Lernraum wiederholt deine Fehler und festigt dein Wissen. Wir haben neue Übungen für dich vorbereitet.')}
                                </p>
                                <button
                                    onClick={startNewSession}
                                    className="btn-primary w-full flex items-center justify-center text-lg py-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <PlayIcon className="w-6 h-6 mr-2" />
                                    {t('learning.start_btn', 'Sitzung starten')}
                                </button>
                            </>
                        )}
                    </div>

                    <LearningOnboardingModal
                        isOpen={showOnboarding}
                        onClose={handleOnboardingClose}
                    />
                </main>
            </div>
        )
    }

    // 2. SUMMARY (DONE) SCREEN
    if (viewState === 'summary') {
        // Trigger a refresh of stats when entering summary to show growth
        // Use logic to show delta if possible, for now just show updated core

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                                <HomeIcon className="w-6 h-6 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">{t('learning.title', 'Lernraum')}</h1>
                        </div>
                    </div>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    {/* The Dopamine Core */}
                    <div className="mb-8">
                        <KnowledgeCore
                            percentage={stats?.masteryPercentage || 0}
                            size="lg"
                            animate={true}
                        />
                        <div className="text-center mt-2 text-green-600 font-bold animate-pulse">
                            {t('learning.updated', 'Wissen aktualisiert!')}
                        </div>
                    </div>

                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('learning.done.title', 'Klasse!')}</h2>
                        <p className="text-gray-600 mb-8">
                            {t('learning.done.desc', 'Du hast diese Runde erfolgreich beendet.')}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={startNewSession}
                                className="btn-primary w-full flex items-center justify-center"
                            >
                                <ArrowRightIcon className="w-5 h-5 mr-2" />
                                {t('learning.next_batch', 'Nächste Runde starten')}
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {t('learning.home', 'Zurück zur Übersicht')}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // 3. ACTIVE LEARNING
    const currentQuestion = questions[currentQuestionIndex]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
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
                        {/* Context / Origin Pill */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-full truncate">
                                <BookOpenIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{getContextLabel(currentQuestion)}</span>
                            </span>
                        </div>

                        <MultipleChoiceQuestion
                            question={currentQuestion}
                            choices={currentQuestion.choices || []}
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
