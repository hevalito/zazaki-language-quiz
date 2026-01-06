"use client"

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useUnlockStore } from '@/lib/store/unlock-store'
import { MultipleChoiceQuestion } from '@/components/questions/multiple-choice-question'
import type { Question, Choice, MultiLanguageContent } from '@/types'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  TrophyIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useWebPush } from '@/hooks/use-web-push'

interface QuizData {
  id: string
  title: MultiLanguageContent
  description?: MultiLanguageContent
  questions: QuestionData[]
  lesson: {
    title: MultiLanguageContent
    chapter: {
      title: MultiLanguageContent
      course: {
        title: MultiLanguageContent
      }
    }
  } | null
  config?: {
    randomize?: boolean
    randomizeAnswers?: boolean
  }
}

interface QuestionData {
  id: string
  type: string
  prompt: MultiLanguageContent
  points: number
  audioUrl?: string
  videoUrl?: string
  imageUrl?: string
  explanation?: MultiLanguageContent
  hints?: MultiLanguageContent
  choices: ChoiceData[]
}

interface ChoiceData {
  id: string
  label: MultiLanguageContent
  order: number
  mediaUrl?: string
  isCorrect: boolean
}

interface Answer {
  questionId: string
  choiceId: string
  timeSpent: number
  isCorrect?: boolean
  pointsEarned?: number
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { addBadges } = useUnlockStore()
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizResults, setQuizResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  useEffect(() => {
    if (params.id) {
      fetchQuiz(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleRestart = async () => {
    setLoading(true)
    try {
      if (quiz?.id) {
        await fetch(`/api/quiz/${quiz.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: [] })
        })
      }
    } catch (e) {
      console.error('Error restarting:', e)
    }
    window.location.reload()
  }

  const fetchQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()

        // Handle randomization (careful with persistence)
        // Ideally we shouldn't re-randomize if resuming, but if we do, we match by ID
        if (data.config?.randomize) {
          data.questions = data.questions.sort(() => Math.random() - 0.5)
        }

        setQuiz(data)

        // Reset or Restore state
        let restoredAnswers: Answer[] = []
        if (data.activeAttempt?.answers) {
          restoredAnswers = data.activeAttempt.answers.map((a: any) => ({
            questionId: a.questionId,
            choiceId: a.responseData?.choiceId,
            timeSpent: a.timeSpent,
            isCorrect: a.isCorrect,
            pointsEarned: a.pointsEarned
          }))
          setAnswers(restoredAnswers)
        } else {
          setAnswers([])
        }

        // Find first unanswered question to resume
        if (data.activeAttempt) {
          const firstUnansweredIndex = data.questions.findIndex((q: any) =>
            !restoredAnswers.find(a => a.questionId === q.id)
          )
          setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0)

          // If all answered, show result?
          if (firstUnansweredIndex === -1 && restoredAnswers.length > 0) {
            setShowResult(true)
            // Fetch full results?
            // For now just show result screen.
            setQuizResults({
              score: data.activeAttempt.score,
              percentage: Math.round((data.activeAttempt.score / (data.questions.length * 10)) * 100), // Approx
              results: restoredAnswers // minimal data needed for list
            })
          } else {
            setShowResult(false)
          }
        } else {
          setCurrentQuestionIndex(0)
          setShowResult(false)
        }

      } else {
        console.error('Failed to fetch quiz')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (choiceId: string, isCorrect: boolean) => {
    if (!quiz || submitting) return

    const timeSpent = Date.now() - questionStartTime
    const currentQuestion = quiz.questions[currentQuestionIndex]

    // Optimistically update UI? No, strict persistence requested.
    setSubmitting(true)
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          choiceId,
          timeSpent
        })
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'Question already answered') {
          // Determine we are out of sync, reload?
          // Or just ignore.
          return
        }
        throw new Error('Failed to save')
      }

      const savedAnswer = await res.json()

      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        choiceId,
        timeSpent,
        isCorrect: savedAnswer.isCorrect // Use server result
      }

      setAnswers(prev => {
        // Prevent duplicates just in case
        const filtered = prev.filter(a => a.questionId !== currentQuestion.id)
        return [...filtered, newAnswer]
      })

    } catch (error) {
      console.error('Error saving answer:', error)
      alert('Could not save answer. Please check connection.')
    } finally {
      setSubmitting(false)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      submitQuiz()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const submitQuiz = async () => {
    if (!quiz || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      })

      if (response.ok) {
        const results = await response.json()
        setQuizResults(results)

        // Trigger unlocks if any
        if (results.newBadges && results.newBadges.length > 0) {
          addBadges(results.newBadges)
        }

        setShowResult(true)
      } else {
        console.error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTitle = (titleObj: any) => {
    if (typeof titleObj === 'string') return titleObj
    return titleObj?.de || titleObj?.en || Object.values(titleObj)[0] || ''
  }

  const getCurrentAnswer = () => {
    if (!quiz) return null
    const currentQuestion = quiz.questions[currentQuestionIndex]
    return answers.find(a => a.questionId === currentQuestion.id)
  }

  const isAnswered = () => {
    return getCurrentAnswer() !== undefined
  }

  // Memoize shuffled choices so they don't re-shuffle on re-renders (like selecting an answer)
  // Only re-shuffle when the question index changes
  const displayChoices = useMemo(() => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return []

    const currentQ = quiz.questions[currentQuestionIndex]
    // Default to true if undefined, for backward compatibility or desired default
    const shouldRandomize = quiz.config?.randomizeAnswers ?? true

    if (!shouldRandomize) {
      return currentQ.choices
    }

    // Create a copy and shuffle
    return [...currentQ.choices].sort(() => Math.random() - 0.5)
  }, [quiz, currentQuestionIndex])

  const successMessage = useMemo(() => {
    const messages = ["Zaf rind o!", "Rind o!", "Aferîn!"]
    return messages[Math.floor(Math.random() * messages.length)]
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz nicht gefunden</p>
        </div>
      </div>
    )
  }

  if (showResult && quizResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz beendet!</h1>
              <p className="text-gray-600">{successMessage}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quizResults.score}</div>
                <div className="text-sm text-blue-600">XP (Gesamt)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quizResults.percentage}%</div>
                <div className="text-sm text-green-600">Genauigkeit</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {quizResults.xpEarned ?? 0}
                </div>
                <div className="text-sm text-yellow-600">XP (Neu)</div>
              </div>
            </div>

            {quizResults.score > 0 && quizResults.xpEarned === 0 && (
              <div className="mb-6 p-4 bg-gray-50 text-gray-600 rounded-lg text-sm text-center border border-gray-200">
                Dein Ergebnis wurde gespeichert, aber da du dieses Quiz bereits abgeschlossen hast, gibt es für diese Wiederholung keine XP.
              </div>
            )}

            {quiz.type === 'DAILY' && <NotificationPrompt />}

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Fragenübersicht</h3>
              {quiz.questions.map((question, index) => {
                const result = quizResults.results.find((r: any) => r.questionId === question.id)
                return (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Frage {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {result?.pointsEarned || 0} / {question.points} XP
                      </span>
                      {result?.isCorrect ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 text-xs">✗</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 btn-secondary"
              >
                Zurück zur Startseite
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 btn-primary"
              >
                Quiz wiederholen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100



  interface QuizData {
    id: string
    type?: string
    title: MultiLanguageContent
    description?: MultiLanguageContent
    questions: QuestionData[]
    lesson: {
      title: MultiLanguageContent
      chapter: {
        title: MultiLanguageContent
        course: {
          title: MultiLanguageContent
        }
      }
    } | null
    config?: {
      randomize?: boolean
      randomizeAnswers?: boolean
    }
    activeAttempt?: any
  }

  // ... inside component ...

  const isDaily = quiz.type === 'DAILY'

  return (
    <div className={`min-h-screen ${isDaily ? 'bg-indigo-50' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b ${isDaily ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-600' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/library')}
              className={`flex items-center space-x-2 ${isDaily ? 'text-indigo-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Zurück</span>
            </button>

            <div className="text-center">
              <h1 className={`font-semibold ${isDaily ? 'text-white' : 'text-gray-900'}`}>{getTitle(quiz.title)}</h1>
              <p className={`text-sm ${isDaily ? 'text-indigo-200' : 'text-gray-500'}`}>
                {getTitle(quiz.lesson?.chapter?.course?.title || { en: 'Daily Challenge', de: 'Tägliche Herausforderung' })}
              </p>
            </div>

            <div className={`flex items-center space-x-2 text-sm ${isDaily ? 'text-indigo-100' : 'text-gray-600'}`}>
              <ClockIcon className="w-4 h-4" />
              <span>{currentQuestionIndex + 1} / {quiz.questions.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`w-full rounded-full h-2 ${isDaily ? 'bg-black/20' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${isDaily ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-blue-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Frage {currentQuestionIndex + 1}
              </span>
              <span className="text-sm text-gray-500">
                {currentQuestion.points} XP
              </span>
            </div>
          </div>

          <MultipleChoiceQuestion
            question={{
              id: currentQuestion.id,
              type: 'MULTIPLE_CHOICE' as const,
              prompt: currentQuestion.prompt,
              dialectCode: 'zazaki-xx',
              script: 'LATIN' as const,
              difficulty: 1,
              points: currentQuestion.points,
              quizId: quiz.id,
              audioUrl: currentQuestion.audioUrl,
              videoUrl: currentQuestion.videoUrl,
              imageUrl: currentQuestion.imageUrl,
              settings: {},
              explanation: currentQuestion.explanation,
              hints: currentQuestion.hints,
              createdAt: new Date(),
              updatedAt: new Date()
            }}
            choices={displayChoices.map(choice => ({
              ...choice,
              questionId: currentQuestion.id
            }))}
            onAnswer={handleAnswer}
            selectedChoiceId={getCurrentAnswer()?.choiceId}
            showResult={!!getCurrentAnswer()}
          />

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Zurück</span>
            </button>

            <button
              onClick={nextQuestion}
              disabled={!isAnswered() || submitting}
              className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {currentQuestionIndex === quiz.questions.length - 1
                  ? (submitting ? 'Wird gesendet...' : 'Quiz abgeben')
                  : 'Weiter'
                }
              </span>
              {currentQuestionIndex < quiz.questions.length - 1 && (
                <ArrowRightIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function NotificationPrompt() {
  const { isSupported, isSubscribed, subscribe, loading, permissionState } = useWebPush()
  const [dismissed, setDismissed] = useState(false)

  if (!isSupported || isSubscribed || dismissed || permissionState === 'denied') {
    return null
  }

  return (
    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-100 p-2 rounded-full">
          <BellIcon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-semibold text-indigo-900 text-sm">Nicht verpassen!</h4>
          <p className="text-xs text-indigo-700">Lass dich benachrichtigen, wenn das nächste Quiz da ist.</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-indigo-500 hover:text-indigo-700 px-2 py-1"
        >
          Später
        </button>
        <button
          onClick={() => subscribe()}
          disabled={loading}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          {loading ? '...' : 'Aktivieren'}
        </button>
      </div>
    </div>
  )
}
