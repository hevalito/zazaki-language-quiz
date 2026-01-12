import { prisma } from '@/lib/prisma'
import {
  UserGroupIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { AdminPage, AdminPageContent } from '@/components/admin/page-layout'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [
    userCount,
    courseCount,
    questionCount,
    attemptCount,
    recentAttempts,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.question.count(),
    prisma.attempt.count(),
    prisma.attempt.findMany({
      take: 5,
      orderBy: { completedAt: 'desc' },
      where: { completedAt: { not: null } },
      include: {
        user: true,
        quiz: { include: { lesson: { include: { chapter: { include: { course: true } } } } } }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <AdminPage>
      <AdminPageContent>
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your learning platform efficiently.</p>
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 font-mono">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Learners"
            value={userCount}
            icon={UserGroupIcon}
            color="blue"
          />
          <StatCard
            title="Active Courses"
            value={courseCount}
            icon={BookOpenIcon}
            color="indigo"
          />
          <StatCard
            title="Questions Bank"
            value={questionCount}
            icon={QuestionMarkCircleIcon}
            color="purple"
          />
          <StatCard
            title="Total Attempts"
            value={attemptCount}
            icon={ChartBarIcon}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
                Recent Activity
              </h2>
              <div className="space-y-8">
                {recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt) => (
                    <ActivityItem key={attempt.id} attempt={attempt} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No recent activity found.</p>
                  </div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                <a href="/admin/activity" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center group">
                  View all user activity
                  <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar: Quick Actions & New Users */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-6 flex items-center text-gray-100">
                  <BoltIcon className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <ActionButton href="/admin/courses/new" label="Create New Course" />
                  <ActionButton href="/admin/quizzes/new" label="Draft New Quiz" />
                  <ActionButton href="/admin/questions" label="Manage Question Bank" />
                  <ActionButton href="/admin/daily-quiz" label="Manage Daily Quiz" />
                </div>
              </div>
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2 text-gray-400" />
                Newest Members
              </h2>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-700">
                      {(user.nickname || user.name || user.firstName || 'U')[0]?.toUpperCase()}
                    </div>
                    <div className="ml-3 truncate flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.nickname || user.name || user.firstName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-300 font-mono">
                      {new Date(user.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <p className="text-gray-400 text-sm">No users yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminPageContent>
    </AdminPage>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color] || 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ attempt }: { attempt: any }) {
  const scoreColor = attempt.percentage >= 80 ? 'text-emerald-600' : 'text-yellow-600'
  // Fallback logic for titles
  const quizTitle = attempt.quiz?.lesson?.title?.de || attempt.quiz?.lesson?.title?.en || 'Untitled Quiz'
  const courseTitle = attempt.quiz?.lesson?.chapter?.course?.title?.de || attempt.quiz?.lesson?.chapter?.course?.title?.en || 'Untitled Course'

  return (
    <div className="relative pl-6 pb-2 border-l-2 border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-100 dark:border-indigo-900/50 transition-colors group-hover:border-indigo-500"></div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {attempt.user?.nickname || attempt.user?.name || 'User'} <span className="font-normal text-gray-500 dark:text-gray-400">completed</span> {quizTitle}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {courseTitle} • {new Date(attempt.completedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${scoreColor}`}>
            {attempt.score} XP
          </span>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-sm font-medium text-white/90"
    >
      {label}
      <PlusIcon className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
    </a>
  )
}
