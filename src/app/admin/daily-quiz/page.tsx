'use client'

import { useState, useEffect } from 'react'
import {
    BoltIcon,
    ArrowPathIcon,
    TrashIcon,
    CheckCircleIcon,
    CalendarIcon
} from '@heroicons/react/24/outline'
import { isSameDay } from 'date-fns'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'

export default function DailyQuizAdminPage() {
    const [generating, setGenerating] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [dateStr, setDateStr] = useState('')
    const [history, setHistory] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(true)

    useEffect(() => {
        setDateStr(new Date().toLocaleDateString())
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setLoadingHistory(true)
        try {
            const res = await fetch('/api/admin/daily-quiz/history')
            if (res.ok) {
                const data = await res.json()
                setHistory(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleGenerate = async () => {
        setGenerating(true)
        setResult(null)
        setError('')
        try {
            const res = await fetch('/api/admin/daily-quiz/generate', {
                method: 'POST'
            })
            const data = await res.json()
            if (res.ok) {
                setResult(data)
                fetchHistory() // Refresh list
            } else {
                setError(data.message || data.error || 'Failed to generate')
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setGenerating(false)
        }
    }

    const handleDeleteQuiz = async (id: string, date: string) => {
        if (!confirm(`Are you sure you want to delete the Daily Quiz for ${new Date(date).toLocaleDateString()}? Questions will return to the pool.`)) return

        try {
            const res = await fetch(`/api/admin/daily-quiz/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchHistory()
                if (result && result.quizId === id) setResult(null) // Clear result if we deleted the just-generated one
            } else {
                alert('Failed to delete')
            }
        } catch (e) {
            console.error(e)
            alert('Error deleting quiz')
        }
    }

    return (
        <AdminPage>
            <AdminPageHeader
                title="Daily Quiz Manager"
                description="Manage the daily quiz system and question pool."
            />

            <AdminPageContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Generator Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <BoltIcon className="w-5 h-5 mr-2 text-yellow-500" />
                            Generate Today's Quiz
                        </h2>
                        {/* Check if today's quiz exists */}
                        {history.some(q => isSameDay(new Date(q.date), new Date())) ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                <CheckCircleIcon className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-2" />
                                <h3 className="text-green-800 dark:text-green-300 font-bold text-lg">Daily Quiz Ready</h3>
                                <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                                    The quiz for today ({dateStr}) has already been generated.
                                </p>
                                <button
                                    disabled
                                    className="w-full btn-secondary opacity-50 cursor-not-allowed flex justify-center items-center"
                                >
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    Generated
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Manually trigger the daily quiz generation. This picks 5 questions from the pool and creates a new Daily Quiz for today ({dateStr}).
                                </p>

                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="w-full btn-primary flex justify-center items-center"
                                >
                                    {generating ? (
                                        <>Generating...</>
                                    ) : (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                                            Generate Now
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {result && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm border border-green-100 dark:border-green-800">
                                <div className="flex items-center font-bold mb-1">
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    Success!
                                </div>
                                Quiz ID: {result.quizId}<br />
                                Questions: {result.questionCount}
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-100 dark:border-red-800">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            How it works
                        </h2>
                        <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-2">
                            <li>Questions created without a specific Quiz ID go into the <b>Pool</b>.</li>
                            <li>Daily Quiz selects 5 random questions from the Pool.</li>
                            <li>Selected questions are moved to the Daily Quiz (removed from Pool).</li>
                            <li>Unused Daily Quizzes can be deleted to return questions to the Pool.</li>
                        </ul>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            To add questions, go to "Questions" and create new ones WITHOUT assigning a quiz.
                        </p>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
                            Daily Quiz History
                        </h2>
                    </div>

                    {loadingHistory ? (
                        <div className="p-8 text-center text-gray-400">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No daily quizzes generated yet.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {history.map((quiz) => (
                                    <tr key={quiz.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {new Date(quiz.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {quiz.questionCount} Questions
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono text-xs">
                                            {quiz.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz.id, quiz.date)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center justify-end w-full"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-1" />
                                                Delete & Return
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </AdminPageContent>
        </AdminPage>
    )
}
