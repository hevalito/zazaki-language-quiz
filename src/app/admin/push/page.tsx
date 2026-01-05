"use client"

import { useState, useEffect } from 'react'
import {
    PaperAirplaneIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function AdminPushPage() {
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        url: ''
    })
    const [result, setResult] = useState<any>(null)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm('Are you sure you want to send this to ALL subscribers?')) return

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
                setFormData({ title: '', body: '', url: '' })
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Push Broadcast</h1>
                    <p className="text-gray-500">Send notifications to all subscribed users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <form onSubmit={handleSend} className="space-y-4">
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
        </div>
    )
}
