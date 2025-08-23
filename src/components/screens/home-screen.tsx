"use client"

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { 
  FireIcon, 
  TrophyIcon, 
  PlayIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid'

export function HomeScreen() {
  const { data: session } = useSession()
  const [selectedScript, setSelectedScript] = useState<'LATIN' | 'ARABIC'>('LATIN')

  const user = session?.user
  const streak = user?.streak || 0
  const totalXP = user?.totalXP || 0
  const dailyGoal = user?.dailyGoal || 50
  const todayXP = 25 // This would come from today's progress

  const progressPercentage = Math.min((todayXP / dailyGoal) * 100, 100)

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
                <p className="text-sm text-gray-500">Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!</p>
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
              <button className="p-2 hover:bg-gray-100 rounded-full">
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
            <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
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
                <span className="text-green-600 font-medium text-sm">🎉 Daily goal completed!</span>
              </div>
            )}
          </div>
        </div>

        {/* Script Toggle */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Script Preference</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedScript('LATIN')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                selectedScript === 'LATIN'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Latin</div>
                <div className="text-sm text-gray-600 mt-1">Zazaki (Latin)</div>
              </div>
            </button>
            <button
              onClick={() => setSelectedScript('ARABIC')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                selectedScript === 'ARABIC'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Arabic</div>
                <div className="text-sm text-gray-600 mt-1 script-arabic">زازاکی</div>
              </div>
            </button>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
            <span className="text-sm text-gray-500">Lesson 3 of 12</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Greetings & Basic Phrases</h4>
                <p className="text-sm text-gray-600">Learn common greetings in Zazaki</p>
                <div className="mt-2">
                  <div className="progress-bar h-1">
                    <div className="progress-fill" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <button className="btn-primary w-full">
              Continue Lesson
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="card-interactive text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <PlayIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Practice</h4>
            <p className="text-sm text-gray-600">Quick review session</p>
          </button>
          
          <button className="card-interactive text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrophyIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Achievements</h4>
            <p className="text-sm text-gray-600">View your progress</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completed "Basic Greetings"</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">+15 XP</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FireIconSolid className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">3-day streak!</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <span className="text-sm text-orange-600 font-medium">Streak</span>
            </div>
          </div>
        </div>

        {/* Sign Out (temporary for development) */}
        <div className="card">
          <button
            onClick={() => signOut()}
            className="btn-secondary w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
