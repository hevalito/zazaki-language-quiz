"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MultipleChoiceQuestion } from '@/components/questions/multiple-choice-question'
import type { Question, Choice, MultiLanguageContent } from '@/types'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

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
}

interface Answer {
  questionId: string
  choiceId: string
  timeSpent: number
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
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

  const fetchQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
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

  const handleAnswer = (choiceId: string, isCorrect: boolean) => {
    if (!quiz) return

    const timeSpent = Date.now() - questionStartTime
    const currentQuestion = quiz.questions[currentQuestionIndex]

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      choiceId,
      timeSpent
    }

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id)
      return [...filtered, newAnswer]
    })
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
              <p className="text-gray-600">Gut gemacht!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quizResults.score}</div>
                <div className="text-sm text-blue-600">Punkte</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quizResults.percentage}%</div>
                <div className="text-sm text-green-600">Genauigkeit</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{quiz.questions.length}</div>
                <div className="text-sm text-purple-600">Fragen</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Fragenübersicht</h3>
              {quiz.questions.map((question, index) => {
                const result = quizResults.results.find((r: any) => r.questionId === question.id)
                return (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Frage {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {result?.pointsEarned || 0} / {question.points} Pkt
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
                onClick={() => window.location.reload()}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Zurück</span>
            </button>

            <div className="text-center">
              <h1 className="font-semibold text-gray-900">{getTitle(quiz.title)}</h1>
              <p className="text-sm text-gray-500">
                {getTitle(quiz.lesson.chapter.course.title)}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>{currentQuestionIndex + 1} / {quiz.questions.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                {currentQuestion.points} Punkte
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
            choices={currentQuestion.choices.map(choice => ({
              ...choice,
              questionId: currentQuestion.id,
              isCorrect: false // This will be handled by the API
            }))}
            onAnswer={handleAnswer}
            selectedChoiceId={getCurrentAnswer()?.choiceId}
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
