'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChatBubbleLeftRightIcon,
    FunnelIcon,
    XMarkIcon,
    InboxIcon,
    CheckIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Dialog } from '@headlessui/react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// Keeping Admin Strings hardcoded or English/German mixed for now as Admin UI
// is often less strictly localized, but for "ALL STRINGS", I will tokenize it.
// Assuming "useTranslation" hook is available and working.

import { useTranslation } from '@/hooks/use-translation'

export default function AdminFeedbackPage() {
    const { t } = useTranslation()
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [selectedItem, setSelectedItem] = useState<any>(null)

    const { data, mutate, isLoading } = useSWR(
        `/api/admin/feedback?status=${statusFilter}&type=${typeFilter}`,
        fetcher
    )

    const items = data?.items || []

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.feedback.title', 'Feedback Management')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('admin.feedback.subtitle', 'Feature Requests, Bugs und Support-Anfragen')}</p>
                </div>
                <div className="flex gap-2">
                    {/* Filters */}
                    <select
                        className="rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">{t('admin.feedback.filter.status.all', 'Alle Status')}</option>
                        <option value="OPEN">{t('admin.feedback.status.open', 'Offen')}</option>
                        <option value="IN_PROGRESS">{t('admin.feedback.status.in_progress', 'In Bearbeitung')}</option>
                        <option value="RESOLVED">{t('admin.feedback.status.resolved', 'Erledigt')}</option>
                        <option value="DISMISSED">{t('admin.feedback.status.dismissed', 'Abgelehnt')}</option>
                    </select>
                    <select
                        className="rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="ALL">{t('admin.feedback.filter.type.all', 'Alle Typen')}</option>
                        <option value="BUG">{t('admin.feedback.type.bug', 'Bugs')}</option>
                        <option value="FEATURE">{t('admin.feedback.type.feature', 'Wünsche')}</option>
                        <option value="SUPPORT">{t('admin.feedback.type.support', 'Support')}</option>
                        <option value="OTHER">{t('admin.feedback.type.other', 'Sonstiges')}</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('common.loading', 'Lädt...')}</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <InboxIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('admin.feedback.empty', 'Kein Feedback gefunden')}</p>
                    </div>
                ) : (
                    items.map((item: any) => (
                        <Card key={item.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedItem(item)}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <StatusBadge status={item.status} />
                                        <TypeBadge type={item.type} />
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {format(new Date(item.createdAt), 'dd. MMM yyyy HH:mm', { locale: de })}
                                        </span>
                                    </div>
                                    <p className="text-gray-900 dark:text-gray-100 font-medium line-clamp-2 mb-2">{item.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">

                                        <div className="flex items-center gap-1">
                                            {item.user ? (
                                                <>
                                                    <img src={item.user.image || `https://ui-avatars.com/api/?name=${item.user.name}`} className="w-4 h-4 rounded-full" />
                                                    <span>{item.user.name || item.user.nickname}</span>
                                                </>
                                            ) : (
                                                <span>{item.userEmail || t('common.anonymous', 'Anonym')}</span>
                                            )}
                                        </div>
                                        {item.pageUrl && (
                                            <span className="truncate max-w-[200px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                {item.pageUrl}
                                            </span>
                                        )}
                                        {/* Explicit Reply prompt if not yet answered */}
                                        {!item.adminResponse && item.status !== 'RESOLVED' && (
                                            <span className="text-indigo-600 dark:text-indigo-400 font-medium ml-auto flex items-center hover:underline">
                                                <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
                                                {t('admin.feedback.reply_action', 'Antworten')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Visual indicator for answered feedback */}
                                {item.adminResponse && (
                                    <div className="flex-shrink-0 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-1 rounded-full" title={t('admin.feedback.replied', 'Beantwortet')}>
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <ReplyDialog
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onUpdate={() => { mutate(); setSelectedItem(null) }}
            />
        </div>
    )
}

function ReplyDialog({ item, isOpen, onClose, onUpdate }: any) {
    const { t } = useTranslation()
    const [response, setResponse] = useState('')
    const [isSending, setIsSending] = useState(false)

    if (!item) return null

    const handleUpdateStatus = async (status: string) => {
        try {
            await fetch(`/api/admin/feedback?id=${item.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            })
            toast.success(t('admin.feedback.toast.status_updated', 'Status aktualisiert'))
            onUpdate()
        } catch {
            toast.error(t('common.error', 'Fehler beim Aktualisieren'))
        }
    }

    const handleSendReply = async () => {
        if (!response.trim()) return
        setIsSending(true)
        try {
            await fetch(`/api/admin/feedback?id=${item.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ adminResponse: response, status: 'RESOLVED' })
            })
            toast.success(t('admin.feedback.toast.reply_sent', 'Antwort gesendet & als erledigt markiert'))
            onUpdate()
            setResponse('')
        } catch {
            toast.error(t('common.error.send', 'Fehler beim Senden'))
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t('admin.feedback.details.title', 'Feedback Details')}</h3>
                        <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Original Message */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('admin.feedback.from', 'Nachricht von')} {item.user?.name || item.userEmail || t('common.guest', 'Gast')}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{format(new Date(item.createdAt), 'PPP p', { locale: de })}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {item.message}
                            </div>

                            {/* Technical details accordion could go here */}
                            {(item.pageUrl || item.deviceInfo) && (
                                <div className="mt-2 text-xs text-gray-400 font-mono">
                                    {item.pageUrl && <div>URL: {item.pageUrl}</div>}
                                    {item.deviceInfo && <div>Device: {JSON.stringify(item.deviceInfo)}</div>}
                                </div>
                            )}
                        </div>

                        {/* Previous Admin Response */}
                        {item.adminResponse && (
                            <div className="pl-8 border-l-2 border-green-200 dark:border-green-800">
                                <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                    {t('admin.feedback.responded_at', 'Antwort gesendet am')} {item.respondedAt ? format(new Date(item.respondedAt), 'PPP p', { locale: de }) : '-'}
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-gray-800 dark:text-gray-200 text-sm">
                                    {item.adminResponse}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.feedback.reply_label', 'Antworten an Nutzer')}</label>
                            {(item.user?.email || item.userEmail) ? (
                                <textarea
                                    className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder={t('admin.feedback.reply_placeholder', 'Deine Antwort wird per Email gesendet...')}
                                    value={response}
                                    onChange={e => setResponse(e.target.value)}
                                />
                            ) : (
                                <div className="bg-orange-50 text-orange-800 p-3 rounded text-sm">
                                    {t('admin.feedback.no_email', 'Keine Email-Adresse vorhanden. Antwort kann nicht gesendet werden.')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <div className="flex gap-2">
                            {/* Status Toggles */}
                            {item.status !== 'RESOLVED' && (
                                <Button size="sm" onClick={() => handleUpdateStatus('RESOLVED')} className="bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20">
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    {t('admin.feedback.mark_resolved', 'Als erledigt markieren')}
                                </Button>
                            )}
                            {item.status !== 'DISMISSED' && (
                                <Button size="sm" onClick={() => handleUpdateStatus('DISMISSED')} className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <ArchiveBoxIcon className="w-4 h-4 mr-1" />
                                    {t('admin.feedback.archive', 'Archivieren')}
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={onClose} className="bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none">{t('common.cancel', 'Abbrechen')}</Button>
                            <Button onClick={handleSendReply} disabled={isSending || !response.trim() || !(item.user?.email || item.userEmail)}>
                                {isSending ? t('common.sending', 'Sende...') : t('admin.feedback.send_close', 'Antworten & Schließen')}
                            </Button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        OPEN: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
        IN_PROGRESS: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        RESOLVED: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        DISMISSED: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
    }
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.OPEN}`}>
            {status.replace('_', ' ')}
        </span>
    )
}

function TypeBadge({ type }: { type: string }) {
    const styles: any = {
        BUG: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50",
        FEATURE: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50",
        SUPPORT: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/50",
        OTHER: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
    }
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || styles.OTHER}`}>
            {type}
        </span>
    )
}
