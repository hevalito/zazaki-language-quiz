"use client"

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  FireIcon,
  TrophyIcon,
  PlayIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid'
import { DailyQuizCard } from '@/components/dashboard/daily-quiz-card'

interface UserProgress {
  id: string
  name: string | null
  email: string | null
  streak: number
  totalXP: number
  dailyGoal: number
  todayXP: number
  isAdmin: boolean
}

import confetti from 'canvas-confetti'

export function HomeScreen() {
  const { data: session } = useSession()
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
      <header className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo-icon.png"
                  alt="Zazaki"
                  fill
                  className="object-contain" // object-contain to ensure it fits well
                />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-gray-900 leading-tight">Zazaki Quiz</h1>
                <p className="text-xs text-gray-500 font-sans">Xêr ama, {user?.name?.split(' ')[0] || 'Heval'}!</p>
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
        <div className="card relative overflow-hidden group">
          {/* Background Gradient & Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-100/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900">Tagesziel</h2>
              <p className="text-xs text-gray-500 font-medium">
                {todayXP >= dailyGoal ? 'Ziel erreicht! 🔥' : 'Bleib dran!'}
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
              <TrophyIcon className="w-5 h-5 text-primary-600" />
              <span className="font-bold font-sans text-primary-700">{todayXP} / {dailyGoal} XP</span>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
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

            <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
              <span>0 XP</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>

            {todayXP >= dailyGoal && (
              <div className="text-center py-2 animate-bounce-subtle">
                <span className="text-brand-green font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100 shadow-sm flex items-center justify-center w-fit mx-auto">
                  <span className="mr-1">🎉</span> Fantastisch! Tagesziel erreicht
                </span>
              </div>
            )}
          </div>
        </div>


        {/* Daily Progress */}
        {/* ... (previous card ends) ... */}

        {/* Daily Challenge */}
        <DailyQuizCard />

        {/* Continue Learning */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-bold text-gray-900">Weiterlernen</h3>
            {/* <span className="text-sm text-gray-500">Lektion 3 von 12</span> */}
          </div>

          <div className="space-y-4">
            {availableQuizzes.length > 0 ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center border border-brand-green/20">
                    <PlayIcon className="w-6 h-6 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 font-serif text-lg">
                      {(availableQuizzes[0].title as any)?.de || (availableQuizzes[0].title as any)?.en || 'Nächstes Quiz'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {(availableQuizzes[0].lesson.chapter.course.title as any)?.de || 'Lerne Zazaki'}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = `/quiz/${availableQuizzes[0].id}`}
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
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4 font-normal">Keine offenen Quiz gefunden.</p>
                <button
                  onClick={() => window.location.href = '/library'}
                  className="btn-primary w-full"
                >
                  Zur Bibliothek
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/leaderboard'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
              <TrophyIcon className="w-6 h-6 text-primary-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">Bestenliste</h4>
            <p className="text-sm text-gray-600">Vergleiche dich</p>
          </button>

          <button
            onClick={() => window.location.href = '/achievements'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-red/20 transition-colors">
              <FireIcon className="w-6 h-6 text-brand-red" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">Erfolge</h4>
            <p className="text-sm text-gray-600">Sieh deinen Fortschritt</p>
          </button>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="card">
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
    </div>
  )
}
