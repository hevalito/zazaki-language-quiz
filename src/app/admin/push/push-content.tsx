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
                                <TableHead className="w-[50px]"></TableHead>
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
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading history...</TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No history found</TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <HistoryRow key={item.id} item={item} />
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

function HistoryRow({ item }: { item: any }) {
    const [expanded, setExpanded] = useState(false)
    const [recipients, setRecipients] = useState<any[] | null>(null)
    const [loading, setLoading] = useState(false)

    const toggleExpand = async () => {
        if (!expanded && !recipients) {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/push/history/${item.id}`)
                if (res.ok) {
                    setRecipients(await res.json())
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        setExpanded(!expanded)
    }

    return (
        <>
            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={toggleExpand}>
                <TableCell>
                    {expanded ? (
                        <div className="h-4 w-4 text-gray-500">▼</div>
                    ) : (
                        <div className="h-4 w-4 text-gray-500">▶</div>
                    )}
                </TableCell>
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
                    <div className="flex flex-col text-xs">
                        <span className="text-green-600 dark:text-green-400 font-medium">{item.sentCount} sent</span>
                        {item.failedCount > 0 && <span className="text-red-500 dark:text-red-400">({item.failedCount} failed)</span>}
                    </div>
                </TableCell>
                <TableCell className="text-gray-500 dark:text-gray-400">
                    {item.sentBy?.name || item.sentBy?.email || 'System'}
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow>
                    <TableCell colSpan={6} className="bg-gray-50 dark:bg-gray-900/50 p-4">
                        <div className="pl-12 pr-4 py-2">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Recipients Details</h4>
                            {loading ? (
                                <div className="py-4 text-sm text-gray-500">Loading details...</div>
                            ) : recipients && recipients.length > 0 ? (
                                <div className="border rounded-md overflow-hidden dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open Time</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                            {recipients.map((rec: any) => (
                                                <tr key={rec.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {rec.user ? (
                                                            <div className="flex items-center">
                                                                {rec.user.avatarUrl && <img src={rec.user.avatarUrl} className="w-6 h-6 rounded-full mr-2" />}
                                                                <span>{rec.user.nickname || rec.user.name || rec.user.email}</span>
                                                            </div>
                                                        ) : 'Unknown User'}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                        <StatusBadge status={rec.status} />
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {rec.openedAt ? new Date(rec.openedAt).toLocaleString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-red-500">
                                                        {rec.error || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-2 text-sm text-gray-500">No recipient details found.</div>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'SENT': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'OPENED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'FAILED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'QUEUED': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    }
    const color = colors[status] || colors['QUEUED']
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
            {status}
        </span>
    )
}
