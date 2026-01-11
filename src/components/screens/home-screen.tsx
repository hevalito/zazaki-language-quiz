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
  ArrowRightIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckIcon,
  MapIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { FireIcon as FireIconSolid, SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'
import { UserNavToggle } from '@/components/layout/user-nav-toggle'
import { DailyQuizCard } from '@/components/dashboard/daily-quiz-card'


import { InstallPrompt } from '@/components/pwa/install-prompt'
import { useTranslation } from '@/hooks/use-translation'

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
  achievementCount?: number
}

import confetti from 'canvas-confetti'
import { KnowledgeCore } from '@/components/learning/knowledge-core'
import { useMastery } from '@/hooks/use-mastery'

function KnowledgeCoreCard() {
  const { t } = useTranslation()
  const { stats, isLoading } = useMastery()
  const router = useRouter()

  // Only show if we have some data or are loading
  // If stats is 0 items, maybe hide? Or show empty state? Show always to encourage.

  return (
    <div
      onClick={() => router.push('/learning')}
      className="card bg-gray-900 text-white cursor-pointer group relative overflow-hidden flex items-center justify-between p-6"
      id="tour-mastery"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors"></div>

      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-blue-300 font-bold uppercase text-xs tracking-wider">{t('mastery.total', 'Total Knowledge')}</span>
        </div>
        <h3 className="text-xl font-bold font-serif text-white">
          {stats?.totalItems ? t('mastery.title', 'Dein Wissensschatz') : t('mastery.start_title', 'Starte deine Reise')}
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {stats?.totalItems
            ? t('mastery.progress', '{{percent}}% gemeistert').replace('{{percent}}', stats.masteryPercentage.toString())
            : t('mastery.start_desc', 'Lerne deine ersten Wörter')}
        </p>
        <div className="mt-4 flex items-center text-blue-300 text-sm font-bold group-hover:text-blue-200 transition-colors">
          {t('mastery.train', 'Trainieren')} <ArrowRightIcon className="w-4 h-4 ml-1" />
        </div>
      </div>

      <div className="relative z-10 group-hover:scale-110 transition-transform duration-500">
        <KnowledgeCore
          percentage={stats?.masteryPercentage || 0}
          size="sm"
          animate={true}
          showLabel={false}
        />
      </div>
    </div>
  )
}

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
            if (responses[0].status === 404) {
              // User not found in DB but session exists -> Invalid state, force signout
              signOut()
            }
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


  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading.text', 'Tenê vinde. Hawo bar beno...')}</p>
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
            <div className="flex items-center space-x-3 md:hidden">
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
                    ? `${t('header.welcome', 'Xêr ama')}, ${userProgress.firstName}!`
                    : userProgress?.nickname
                      ? `${t('header.welcome', 'Xêr ama')}, ${userProgress.nickname}!`
                      : user?.name?.split(' ')[0]
                        ? `${t('header.welcome', 'Xêr ama')}, ${user.name.split(' ')[0]}!`
                        : t('header.welcome', 'Xêr ama')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              {/* Streak */}
              <div className="flex items-center space-x-1 bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20">
                {streak > 0 ? (
                  <FireIconSolid className="w-4 h-4 text-brand-orange" />
                ) : (
                  <FireIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-bold text-gray-900 font-sans">{streak}</span>
              </div>

              {/* Achievements */}
              <div className="flex items-center space-x-1 bg-purple-600/10 px-3 py-1 rounded-full border border-purple-600/20">
                <SparklesIconSolid className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-gray-900 font-sans">{userProgress?.achievementCount || 0}</span>
              </div>

              <UserNavToggle />
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
            <h2 className="text-lg font-serif font-bold text-gray-900">{t('dailyGoal.title', 'Tagesziel')}</h2>
            <div className={`text-sm font-bold px-3 py-1 rounded-full border ${todayXP >= dailyGoal
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-primary-50 text-primary-700 border-primary-100'
              }`}>
              {todayXP} / {dailyGoal} XP {t('dailyGoal.today', 'Heute')}
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
                  {t('stats.streak', 'Streak')}
                </p>
                <p className="text-lg font-bold text-gray-900">{streak} <span className="text-xs font-normal text-gray-500">{t('stats.streak.days', 'Tage')}</span></p>
              </div>

              {/* Goal % */}
              <div className="text-center group/stat border-l border-r border-gray-100">
                <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center">
                  <TrophyIcon className="w-3 h-3 mr-1" />
                  {t('stats.goal', 'Ziel')}
                </p>
                <p className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}<span className="text-xs">%</span></p>
              </div>

              {/* Total XP */}
              <div className="text-center group/stat">
                <p className="text-xs text-brand-purple font-bold uppercase tracking-wider mb-1 flex items-center justify-center">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  {t('stats.total', 'Gesamt')}
                </p>
                <p className="text-lg font-bold text-gray-900">{totalXP.toLocaleString()}</p>
              </div>
            </div>

            {todayXP >= dailyGoal && !confettiFired && (
              <div className="text-center animate-bounce-subtle mt-2">
                <span className="text-brand-green font-bold text-xs">🎉 {t('dailyGoal.reached', 'Ziel erreicht!')}</span>
              </div>
            )}
          </div>
        </div>


        {/* Daily Progress */}
        {/* ... (previous card ends) ... */}

        {/* --- GLOBAL MASTERY SNAPSHOT --- */}
        <KnowledgeCoreCard />

        {/* Daily Challenge */}
        <div id="tour-daily-challenge">
          <DailyQuizCard />
        </div>

        {/* Continue Learning */}
        <div className="card" id="tour-continue-learning">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-bold text-gray-900">{t('continue.title', 'Weiterlernen')}</h3>
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

                const lastActiveQuiz = sortedCompleted[0]
                const lastActiveLevel = lastActiveQuiz?.lesson?.chapter?.course?.level || userProgress?.currentLevel || 'A1'
                const lastActiveDialect = lastActiveQuiz?.lesson?.chapter?.course?.dialectCode

                // Helper to order levels
                const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                const getNextLevel = (current: string) => {
                  const idx = levelOrder.indexOf(current)
                  return idx !== -1 && idx < levelOrder.length - 1 ? levelOrder[idx + 1] : null
                }

                // Strategy 1: Sticky Context (Same Dialect, Same Level)
                // If the user was working on Dersim A1, give them the next Dersim A1 quiz
                if (lastActiveDialect) {
                  recommendedQuiz = uncompletedQuizzes.find((q: any) =>
                    q.lesson?.chapter?.course?.dialectCode === lastActiveDialect &&
                    q.lesson?.chapter?.course?.level === lastActiveLevel
                  )
                }

                // Strategy 2: Sticky Progression (Same Dialect, Next Level)
                // If no more Dersim A1, look for Dersim A2
                if (!recommendedQuiz && lastActiveDialect) {
                  const nextLevel = getNextLevel(lastActiveLevel)
                  if (nextLevel) {
                    recommendedQuiz = uncompletedQuizzes.find((q: any) =>
                      q.lesson?.chapter?.course?.dialectCode === lastActiveDialect &&
                      q.lesson?.chapter?.course?.level === nextLevel
                    )
                  }
                }

                // Strategy 3: Sticky Fallback (Same Dialect, Any Higher Level)
                // If no Dersim A2, look for any Dersim > current level
                if (!recommendedQuiz && lastActiveDialect) {
                  recommendedQuiz = uncompletedQuizzes.find((q: any) =>
                    q.lesson?.chapter?.course?.dialectCode === lastActiveDialect &&
                    levelOrder.indexOf(q.lesson?.chapter?.course?.level) >= levelOrder.indexOf(lastActiveLevel)
                  )
                }

                // Strategy 4: Fallback to old behavior (Same Level, Any Dialect)
                if (!recommendedQuiz) {
                  recommendedQuiz = uncompletedQuizzes.find((q: any) => q.lesson?.chapter?.course?.level === lastActiveLevel)
                }

                // Strategy 5: Absolute Fallback
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
                          {(recommendedQuiz.title as any)?.de || (recommendedQuiz.title as any)?.en || t('continue.nextQuiz', 'Nächstes Quiz')}
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
                        {t('continue.start', 'Starten')}
                      </button>
                      <button
                        onClick={() => window.location.href = '/library'}
                        className="btn-secondary flex justify-center items-center"
                      >
                        <BookOpenIcon className="w-5 h-5 mr-2" />
                        {t('continue.library', 'Bibliothek')}
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
                    <h4 className="text-gray-900 font-bold mb-2">{t('continue.allDone', 'Wow! Alles erledigt.')}</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      {t('continue.allDoneDesc', 'Du hast alle verfügbaren Lektionen abgeschlossen. Sammle weitere XP mit dem täglichen Quiz!')}
                    </p>
                    <button
                      onClick={() => router.push('/library')}
                      className="btn-primary w-full bg-brand-orange hover:bg-brand-orange/90 border-brand-orange flex items-center justify-center text-center"
                    >
                      <BookOpenIcon className="w-5 h-5 mr-2" />
                      {t('continue.toLibrary', 'Zur Bibliothek')}
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
            id="tour-learning-room-nav"
            onClick={() => window.location.href = '/learning'}
            className="card-interactive text-center group relative"
          >
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse z-10">
              {t('common.new', 'Neu!')}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
              <AcademicCapIcon className="w-6 h-6 text-green-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">{t('quick.learning', 'Lernraum')}</h4>
            <p className="text-sm text-gray-600">{t('quick.learningDesc', 'Trainiere deine Fehler')}</p>
          </button>

          <button
            id="tour-leaderboard-nav"
            onClick={() => window.location.href = '/leaderboard'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
              <TrophyIcon className="w-6 h-6 text-primary-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">{t('quick.leaderboard', 'Bestenliste')}</h4>
            <p className="text-sm text-gray-600">{t('quick.leaderboardDesc', 'Erklimme die Spitze')}</p>
          </button>

          <button
            id="tour-achievements-nav"
            onClick={() => window.location.href = '/achievements'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-red/20 transition-colors">
              <SparklesIcon className="w-6 h-6 text-brand-red" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">{t('quick.achievements', 'Erfolge')}</h4>
            <p className="text-sm text-gray-600">{t('quick.achievementsDesc', 'Sammle Trophäen')}</p>
          </button>
          <button
            onClick={() => window.location.href = '/course-finder'}
            className="card-interactive text-center group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-200 transition-colors">
              <MapIcon className="w-6 h-6 text-teal-700" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1 font-serif">{t('quick.courseFinder', 'Kursfinder')}</h4>
            <p className="text-sm text-gray-600">{t('quick.courseFinderDesc', 'Finde den perfekten Sprachkurs')}</p>
          </button>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="card" id="tour-recent-activity">
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">{t('activity.title', 'Letzte Aktivitäten')}</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center">
                      <span className="text-brand-green text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">"{(activity.title as any)?.de || (activity.title as any)?.en || 'Quiz'}" {t('activity.completed', 'abgeschlossen')}</p>
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
              {t('admin.panel', 'Admin-Bereich')}
            </a>
          )}
          <button
            onClick={() => signOut()}
            className="btn-secondary w-full"
          >
            {t('auth.signOut', 'Abmelden')}
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
