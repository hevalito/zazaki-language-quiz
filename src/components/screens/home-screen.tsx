"use client"

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
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

export function HomeScreen() {
  const { data: session } = useSession()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
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
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Zazaki</h1>
                <p className="text-sm text-gray-500">Willkommen zurück, {user?.name?.split(' ')[0] || 'Lernender'}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Streak */}
              <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-full">
                {streak > 0 ? (
                  <FireIconSolid className="w-4 h-4 text-orange-500" />
                ) : (
                  <FireIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-900">{streak}</span>
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Daily Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tagesfortschritt</h2>
            <div className="flex items-center space-x-1 text-purple-600">
              <TrophyIcon className="w-5 h-5" />
              <span className="font-medium">{totalXP} XP</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{todayXP} / {dailyGoal} XP</span>
              <span className="text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {todayXP >= dailyGoal && (
              <div className="text-center py-2">
                <span className="text-green-600 font-medium text-sm">🎉 Tagesziel erreicht!</span>
              </div>
            )}
          </div>
        </div>


        {/* Continue Learning */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weiterlernen</h3>
            {/* <span className="text-sm text-gray-500">Lektion 3 von 12</span> */}
          </div>

          <div className="space-y-4">
            {availableQuizzes.length > 0 ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {(availableQuizzes[0].title as any)?.de || (availableQuizzes[0].title as any)?.en || 'Nächstes Quiz'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {(availableQuizzes[0].lesson.chapter.course.title as any)?.de || 'Lerne Zazaki'}
                    </p>
                    {/* <div className="mt-2">
                      <div className="progress-bar h-1">
                        <div className="progress-fill" style={{ width: '60%' }} />
                      </div>
                    </div> */}
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
                <p className="text-gray-500 mb-4">Keine offenen Quiz gefunden.</p>
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
            onClick={() => alert('Übungsmodus kommt bald!')}
            className="card-interactive text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <PlayIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Üben</h4>
            <p className="text-sm text-gray-600">Schnelle Wiederholung</p>
          </button>

          <button
            onClick={() => window.location.href = '/achievements'}
            className="card-interactive text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrophyIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Erfolge</h4>
            <p className="text-sm text-gray-600">Sieh deinen Fortschritt</p>
          </button>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">"{(activity.title as any)?.en || 'Quiz'}" abgeschlossen</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">+{activity.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagesziel (XP)
                  </label>
                  <input
                    type="number"
                    value={dailyGoal}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="10"
                    max="200"
                    step="10"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Speichern
                </button>
              </div>
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
