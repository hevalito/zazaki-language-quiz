"use client"

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Add import
import Image from 'next/image'
import {
  FireIcon,
  TrophyIcon,
  PlayIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid'
import { DailyQuizCard } from '@/components/dashboard/daily-quiz-card'

import { InstallPrompt } from '@/components/pwa/install-prompt'

interface UserProgress {
  id: string
  name: string | null
  email: string | null
  streak: number
  totalXP: number
  dailyGoal: number
  todayXP: number
  isAdmin: boolean
  firstName?: string | null
  nickname?: string | null
  currentLevel?: string // Added for Continue Learning logic
  attemptCount?: number
}

import confetti from 'canvas-confetti'

export function HomeScreen() {
  const { data: session } = useSession()
  const router = useRouter() // Initialize router
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [confettiFired, setConfettiFired] = useState(false)


  // Fetch user progress data and available quizzes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = []

        // Only fetch user progress if we have a session
        if (session) {
          promises.push(fetch('/api/user/progress'))
        }

        // Always try to fetch quizzes (for guest mode)
        promises.push(fetch('/api/quizzes'))

        // Fetch recent activity if user is logged in
        if (session) {
          promises.push(fetch('/api/user/activity'))
        }

        const responses = await Promise.all(promises)

        // Handle User Progress Response
        if (session && responses[0]) {
          if (responses[0].ok) {
            const progressData = await responses[0].json()
            setUserProgress(progressData.user)
          } else {
            console.error('Failed to fetch user progress')
          }
        }

        // Handle Quizzes Response
        // If session exists, quizzes is at [1], otherwise [0]
        const quizzesResponse = session ? responses[1] : responses[0]
        if (quizzesResponse && quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json()
          setAvailableQuizzes(quizzesData)
        } else {
          console.log('Quizzes require authentication')
        }

        // Handle Activity Response
        // If session exists, activity is at [2]
        const activityResponse = session ? responses[2] : null
        if (activityResponse && activityResponse.ok) {
          const activityData = await activityResponse.json()
          setRecentActivity(activityData)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const user = userProgress || session?.user
  const streak = userProgress?.streak || 0
  const totalXP = userProgress?.totalXP || 0
  const dailyGoal = userProgress?.dailyGoal || 50
  const todayXP = userProgress?.todayXP || 0

  const progressPercentage = Math.min((todayXP / dailyGoal) * 100, 100)

  useEffect(() => {
    if (todayXP >= dailyGoal && dailyGoal > 0 && !confettiFired && !loading) {
      setConfettiFired(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ec4899', '#eab308']
      })
    }
  }, [todayXP, dailyGoal, confettiFired, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Tenê vinde. Hawo bar beno...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 safe-area-top" id="tour-welcome">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo-icon.png"
                  alt="Zazakî"
                  fill
                  className="object-contain" // object-contain to ensure it fits well
                />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-gray-900 leading-tight">Zazakî Quiz</h1>
                <p className="text-xs text-gray-500 font-sans">
                  {userProgress?.firstName
                    ? `Xêr ama, ${userProgress.firstName}!`
                    : userProgress?.nickname
                      ? `Xêr ama, ${userProgress.nickname}!`
                      : user?.name?.split(' ')[0]
                        ? `Xêr ama, ${user.name.split(' ')[0]}!`
                        : 'Xêr ama'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Streak */}
              <div className="flex items-center space-x-1 bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20">
                {streak > 0 ? (
                  <FireIconSolid className="w-4 h-4 text-brand-orange" />
                ) : (
                  <FireIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-bold text-gray-900 font-sans">{streak}</span>
              </div>

              {/* Settings */}
              <button
                onClick={() => window.location.href = '/settings'}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Einstellungen"
              >
                <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Daily Progress */}
        <div className="card relative overflow-hidden group" id="tour-daily-goal">
          {/* Background Gradient & Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-100/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

          {/* Header Row */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h2 className="text-lg font-serif font-bold text-gray-900">Tagesziel</h2>
            <div className={`text-sm font-bold px-3 py-1 rounded-full border ${todayXP >= dailyGoal
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-primary-50 text-primary-700 border-primary-100'
              }`}>
              {todayXP} / {dailyGoal} XP Heute
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4 relative z-10">
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${todayXP >= dailyGoal
                  ? 'bg-gradient-to-r from-brand-green to-emerald-400'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
                  }`}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full animate-shimmer" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              {/* Streak */}
              <div className="text-center group/stat">
                <p className="text-xs text-brand-orange font-bold uppercase tracking-wider mb-1 flex items-center justify-center">
                  <FireIconSolid className="w-3 h-3 mr-1" />
                  Streak
                </p>
                <p className="text-lg font-bold text-gray-900">{streak} <span className="text-xs font-normal text-gray-500">Tage</span></p>
              </div>

              {/* Goal % */}
              <div className="text-center group/stat border-l border-r border-gray-100">
                <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center">
                  <TrophyIcon className="w-3 h-3 mr-1" />
                  Ziel
                </p>
                <p className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}<span className="text-xs">%</span></p>
              </div>

              {/* Total XP */}
              <div className="text-center group/stat">
                <p className="text-xs text-brand-purple font-bold uppercase tracking-wider mb-1 flex items-center justify-center">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  Gesamt
                </p>
                <p className="text-lg font-bold text-gray-900">{totalXP.toLocaleString()}</p>
              </div>
            </div>

            {todayXP >= dailyGoal && !confettiFired && (
              <div className="text-center animate-bounce-subtle mt-2">
                <span className="text-brand-green font-bold text-xs">🎉 Ziel erreicht!</span>
              </div>
            )}
          </div>
        </div>


        {/* Daily Progress */}
        {/* ... (previous card ends) ... */}

        {/* Daily Challenge */}
        <div id="tour-daily-challenge">
          <DailyQuizCard />
        </div>

        {/* Continue Learning */}
        <div className="card" id="tour-continue-learning">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-bold text-gray-900">Weiterlernen</h3>
          </div>

          <div className="space-y-4">
            {(() => {
              // 1. Filter out completed quizzes & Daily quizzes (just in case)
              const standardQuizzes = availableQuizzes.filter((q: any) => q.type !== 'DAILY')
              const uncompletedQuizzes = standardQuizzes.filter((q: any) => q.status !== 'completed')

              // 2. Find the best next quiz
              let recommendedQuiz = null

              if (uncompletedQuizzes.length > 0) {
                // Determine user's "current level" from the last COMPLETED quiz
                const completedQuizzes = standardQuizzes.filter((q: any) => q.status === 'completed')

                // Sort completed by most recent attempt
                const sortedCompleted = completedQuizzes.sort((a: any, b: any) => {
                  const dateA = new Date(a.attempts[0]?.completedAt || 0).getTime()
                  const dateB = new Date(b.attempts[0]?.completedAt || 0).getTime()
                  return dateB - dateA // Descending
                })

                const lastActiveLevel = sortedCompleted[0]?.lesson?.chapter?.course?.level || userProgress?.currentLevel || 'A1'

                // Strategy A: Find first uncompleted in the SAME level
                recommendedQuiz = uncompletedQuizzes.find((q: any) => q.lesson?.chapter?.course?.level === lastActiveLevel)

                // Strategy B: If none, find first uncompleted in ANY level (trusting the API order or just taking the next available)
                if (!recommendedQuiz) {
                  recommendedQuiz = uncompletedQuizzes[0]
                }
              }

              if (recommendedQuiz) {
                return (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center border border-brand-green/20">
                        <PlayIcon className="w-6 h-6 text-brand-green" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 font-serif text-lg">
                          {(recommendedQuiz.title as any)?.de || (recommendedQuiz.title as any)?.en || 'Nächstes Quiz'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {(recommendedQuiz.lesson?.chapter?.course?.title as any)?.de || 'Lerne Zazakî'}
                          <span className="mx-2">•</span>
                          <span className="text-brand-green font-bold text-xs px-2 py-0.5 bg-brand-green/10 rounded-full">
                            {recommendedQuiz.lesson?.chapter?.course?.level || 'A1'}
                          </span>
                        </p>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => window.location.href = `/quiz/${recommendedQuiz.id}`}
                        className="btn-primary flex justify-center items-center"
                      >
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Starten
                      </button>
                      <button
                        onClick={() => window.location.href = '/library'}
                        className="btn-secondary flex justify-center items-center"
                      >
                        <BookOpenIcon className="w-5 h-5 mr-2" />
                        Bibliothek
                      </button>
                    </div>
                  </>
                )
              } else {
                // All Caught Up State
                return (
                  <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100 p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-gray-900 font-bold mb-2">Wow! Alles erledigt.</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Du hast alle verfügbaren Lektionen abgeschlossen. Sammle weitere XP mit dem täglichen Quiz!
                    </p>
                    <button
                      onClick={() => router.push('/library')}
                      className="btn-primary w-full bg-brand-orange hover:bg-brand-orange/90 border-brand-orange flex items-center justify-center text-center"
                    >
                      <BookOpenIcon className="w-5 h-5 mr-2" />
                      Zur Bibliothek
                    </button>
                  </div>
                )
              }
            })()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/library'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
              <BookOpenIcon className="w-6 h-6 text-indigo-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">Bibliothek</h4>
            <p className="text-sm text-gray-600">Alle Quizze</p>
          </button>
          <button
            id="tour-leaderboard-nav"
            onClick={() => window.location.href = '/leaderboard'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
              <TrophyIcon className="w-6 h-6 text-primary-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">Bestenliste</h4>
            <p className="text-sm text-gray-600">Erklimme die Spitze</p>
          </button>

          <button
            id="tour-achievements-nav"
            onClick={() => window.location.href = '/achievements'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-red/20 transition-colors">
              <FireIcon className="w-6 h-6 text-brand-red" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">Erfolge</h4>
            <p className="text-sm text-gray-600">Sammle Trophäen</p>
          </button>
          <button
            onClick={() => window.location.href = '/course-finder'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-200 transition-colors">
              <MapIcon className="w-6 h-6 text-teal-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">Kursfinder</h4>
            <p className="text-sm text-gray-600">Finde den perfekten Sprachkurs</p>
          </button>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="card" id="tour-recent-activity">
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Letzte Aktivitäten</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center">
                      <span className="text-brand-green text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">"{(activity.title as any)?.de || (activity.title as any)?.en || 'Quiz'}" abgeschlossen</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-brand-green font-bold">+{activity.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Panel Access & Sign Out */}
        <div className="card space-y-3">
          {userProgress?.isAdmin && (
            <a
              href="/admin"
              className="btn-primary w-full text-center block"
            >
              Admin-Bereich
            </a>
          )}
          <button
            onClick={() => signOut()}
            className="btn-secondary w-full"
          >
            Abmelden
          </button>
        </div>
      </div>

      {/* PWA Install Prompt */}
      {userProgress && (
        <InstallPrompt attemptCount={userProgress.attemptCount || 0} />
      )}
    </div>
  )
}
