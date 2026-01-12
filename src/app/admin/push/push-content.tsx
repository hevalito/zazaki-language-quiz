"use client"

import { useState } from 'react'
import {
    PaperAirplaneIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { NotificationSettingsForm } from '../settings/notifications/notification-settings-form'

interface PushBroadcastContentProps {
    initialSettings: Record<string, any>
}

export function PushBroadcastContent({ initialSettings }: PushBroadcastContentProps) {
    const [activeTab, setActiveTab] = useState('send')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        url: '',
        segment: 'ALL'
    })
    const [result, setResult] = useState<any>(null)
    const [history, setHistory] = useState<any[] | null>(null) // null indicates not fetched yet

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

    // Fetch history when tab changes to history
    const onTabChange = (value: string) => {
        setActiveTab(value)
        if (value === 'history' && history === null) {
            fetchHistory()
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
                if (history !== null) fetchHistory() // Refresh history if already loaded
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
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList>
                    <TabsTrigger value="send">
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        Send Broadcast
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Cog6ToothIcon className="w-5 h-5 mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="send">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Form */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800 transition-colors">
                            <form onSubmit={handleSend} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segment</label>
                                    <select
                                        value={formData.segment}
                                        onChange={e => setFormData({ ...formData, segment: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    >
                                        <option value="ALL">All Subscribers</option>
                                        <option value="DAILY">Daily Reminder Opt-ins</option>
                                        <option value="FEATURES">Feature Updates Opt-ins</option>
                                        <option value="WEEKLY">Weekly Summary Opt-ins</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        placeholder="e.g., New Challenge Available!"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.body}
                                        onChange={e => setFormData({ ...formData, body: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        placeholder="e.g., Check out the new Zazaki verbs quiz..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <BellIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                    Preview
                                </h3>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <img src="/icon-192x192.png" className="w-8 h-8 rounded-full" alt="Icon" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formData.title || 'Notification Title'}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{formData.body || 'Notification body text will appear here...'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {result && (
                                <div className={`rounded-lg p-4 border ${result.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                    <div className="flex">
                                        {result.success ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-500 mr-2" />
                                        ) : (
                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" />
                                        )}
                                        <div>
                                            <h3 className={`text-sm font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                                Broadcast Complete
                                            </h3>
                                            <div className={`mt-2 text-sm ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
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
                </TabsContent>

                <TabsContent value="history">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Segment</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Sent By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!history ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading history...</TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No history found</TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{item.title}</div>
                                            <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{item.body}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                {item.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-green-600 dark:text-green-400 font-medium">{item.sentCount} sent</span>
                                            {item.failedCount > 0 && <span className="text-red-500 dark:text-red-400 ml-2">({item.failedCount} failed)</span>}
                                        </TableCell>
                                        <TableCell className="text-gray-500 dark:text-gray-400">
                                            {item.sentBy?.name || item.sentBy?.email || 'Unknown'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent value="settings">
                    <NotificationSettingsForm initialSettings={initialSettings} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
