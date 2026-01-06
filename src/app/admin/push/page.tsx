"use client"

import { useState, useEffect } from 'react'
import {
    PaperAirplaneIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

export default function AdminPushPage() {
    const [activeTab, setActiveTab] = useState<'send' | 'history'>('send')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        url: '',
        segment: 'ALL'
    })
    const [result, setResult] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory()
        }
    }, [activeTab])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/admin/push/history')
            if (res.ok) {
                setHistory(await res.json())
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm(`Send to ${formData.segment} users?`)) return

        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/admin/push/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            setResult(data)

            if (data.success) {
                setFormData({ title: '', body: '', url: '', segment: 'ALL' })
            }
        } catch (error) {
            console.error(error)
            alert('Failed to send broadcast')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('send')}
                        className={`${activeTab === 'send' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        Send Broadcast
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <ClockIcon className="w-5 h-5 mr-2" />
                        History
                    </button>
                </nav>
            </div>

            {activeTab === 'send' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                                <select
                                    value={formData.segment}
                                    onChange={e => setFormData({ ...formData, segment: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="ALL">All Subscribers</option>
                                    <option value="DAILY">Daily Reminder Opt-ins</option>
                                    <option value="FEATURES">Feature Updates Opt-ins</option>
                                    <option value="WEEKLY">Weekly Summary Opt-ins</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="e.g., New Challenge Available!"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.body}
                                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="e.g., Check out the new Zazaki verbs quiz..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="/quiz/daily"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                                            Send Broadcast
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results/Preview */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                                <BellIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Preview
                            </h3>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-start space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <img src="/icon-192x192.png" className="w-8 h-8 rounded-full" alt="Icon" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{formData.title || 'Notification Title'}</p>
                                        <p className="text-sm text-gray-600">{formData.body || 'Notification body text will appear here...'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result && (
                            <div className={`rounded-lg p-4 border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex">
                                    {result.success ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                    ) : (
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                                    )}
                                    <div>
                                        <h3 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                            Broadcast Complete
                                        </h3>
                                        <div className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Sent: {result.sent}</li>
                                                <li>Failed: {result.failed}</li>
                                                <li>Removed (Dead): {result.removed}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No history found
                                    </td>
                                </tr>
                            ) : (
                                history.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-bold">{item.title}</div>
                                            <div className="text-gray-500 truncate max-w-xs">{item.body}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="text-green-600 font-medium">{item.sentCount} sent</span>
                                            {item.failedCount > 0 && <span className="text-red-500 ml-2">({item.failedCount} failed)</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.sentBy?.name || item.sentBy?.email || 'Unknown'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
