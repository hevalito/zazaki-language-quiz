"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    UserCircleIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    CameraIcon,
    BellIcon,
    BellSlashIcon
} from '@heroicons/react/24/outline'
import { useWebPush } from '@/hooks/use-web-push'

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [loadingAvatar, setLoadingAvatar] = useState(false)

    const [formData, setFormData] = useState({
        nickname: '',
        firstName: '',
        lastName: '',

        dailyGoal: 100,
        preferredScript: 'LATIN',
        courseFinderData: null,

        notifyDaily: true,
        notifyFeatures: true,
        notifyWeekly: true,
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoadingAvatar(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error)
            }

            const data = await res.json()

            // Force session update to get new image
            await update({
                ...session,
                user: {
                    ...session?.user,
                    image: data.url
                }
            })

            // Show brief success visual if needed, but the image update is the main feedback
        } catch (error) {
            console.error('Failed to upload avatar', error)
            alert('Failed to upload avatar. Please try again.')
        } finally {
            setLoadingAvatar(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                setFormData({
                    nickname: data.nickname || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    dailyGoal: data.dailyGoal || 100,
                    preferredScript: data.preferredScript || 'LATIN',
                    courseFinderData: data.courseFinderData || null,
                    notifyDaily: data.notifyDaily ?? true,
                    notifyFeatures: data.notifyFeatures ?? true,
                    notifyWeekly: data.notifyWeekly ?? true,
                })
            }
        } catch (error) {
            console.error('Failed to fetch profile', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSuccess(false)

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                // Update session to reflect changes if necessary
                await update()
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }
        } catch (error) {
            console.error('Failed to update profile', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Einstellungen</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div id="tour-profile-picture" className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 overflow-hidden ring-4 ring-white shadow-sm transition-all group-hover:ring-primary-100">
                                {loadingAvatar ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                ) : session?.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        // Force reload if URL hasn't changed but content has (though we use unique timestamps usually)
                                        key={session.user.image}
                                    />
                                ) : (
                                    <UserCircleIcon className="w-16 h-16" />
                                )}
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-8 h-8 text-white" />
                            </div>

                            {/* Hidden Input */}
                            <input
                                type="file"
                                id="avatar-input"
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="mt-3 text-sm text-gray-500 font-medium">Klicken zum Ändern</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vorname
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className="input-field"
                                    placeholder="Max"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nachname
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="input-field"
                                    placeholder="Mustermann"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Spitzname (Nickname)
                            </label>
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                                className="input-field"
                                placeholder="Wie sollen wir dich nennen?"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Dieser Name wird auf der Bestenliste angezeigt.
                            </p>
                        </div>



                        {/* Course Finder Result Display */}
                        {/* @ts-ignore */}
                        {formData.courseFinderData?.result && (
                            <>
                                <hr className="border-gray-100" />
                                <div>
                                    <h3 className="block text-sm font-medium text-gray-700 mb-2">Dein Dialekt-Profil</h3>
                                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-primary-600 tracking-wider uppercase">Ergebnis</span>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/course-finder')}
                                                className="text-xs text-primary-700 hover:text-primary-800 underline"
                                            >
                                                Neu ermitteln
                                            </button>
                                        </div>
                                        {/* @ts-ignore */}
                                        <h4 className="text-lg font-serif font-bold text-gray-900">{formData.courseFinderData.result.dialect}</h4>
                                        {/* @ts-ignore */}
                                        <p className="text-sm text-gray-600 mt-1">Empfohlener Kurs: {formData.courseFinderData.result.recommendation}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <hr className="border-gray-100" />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tagesziel (XP)
                            </label>
                            <select
                                value={formData.dailyGoal}
                                onChange={e => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) })}
                                className="input-field"
                            >
                                <option value={50}>50 XP - Entspannt</option>
                                <option value={100}>100 XP - Normal</option>
                                <option value={200}>200 XP - Ernsthaft</option>
                                <option value={250}>250 XP - Intensiv</option>
                                <option value={500}>500 XP - Verrückt</option>
                            </select>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h3 className="block text-sm font-medium text-gray-700 mb-2">Benachrichtigungen</h3>
                            <PushNotificationToggle
                                settings={{
                                    daily: formData.notifyDaily,
                                    features: formData.notifyFeatures,
                                    weekly: formData.notifyWeekly
                                }}
                                onChange={(key, val) => setFormData(prev => ({ ...prev, [key]: val }))}
                            />
                        </div>


                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full btn-primary flex items-center justify-center space-x-2"
                            >
                                {saving ? (
                                    <span>Speichern...</span>
                                ) : (
                                    <>
                                        <span>Speichern</span>
                                        {success && <CheckCircleIcon className="w-5 h-5 ml-1" />}
                                    </>
                                )}
                            </button>
                        </div>

                        {success && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-sm animate-in fade-in slide-in-from-bottom-2">
                                Einstellungen erfolgreich gespeichert!
                            </div>
                        )}
                    </form>

                    <hr className="my-8 border-gray-200" />

                    {/* Danger Zone */}
                    <div className="pt-2">
                        <h3 className="text-lg font-medium text-red-600 mb-2">Gefahrenzone</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Wenn du dein Konto löschst, werden alle deine Daten, einschließlich XP und Abzeichen, unwiderruflich entfernt.
                        </p>
                        <button
                            type="button"
                            onClick={() => document.getElementById('delete-modal')?.classList.remove('hidden')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 hover:border-red-300 rounded-md px-4 py-2 hover:bg-red-50 transition-colors"
                        >
                            Konto löschen
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-gray-400 text-center">Version {process.env.NEXT_PUBLIC_APP_VERSION}</p>
                </div>
            </main >

            {/* Delete Modal */}
            < div id="delete-modal" className="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" >
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Bist du sicher?</h3>
                    <p className="text-gray-600">
                        Wir werden dir eine Bestätigungs-E-Mail senden. Dein Konto wird erst gelöscht, wenn du den Link in der E-Mail bestätigst.
                    </p>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={() => document.getElementById('delete-modal')?.classList.add('hidden')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Abbrechen
                        </button>
                        <DeleteButton />
                    </div>
                </div>
            </div >
        </div >
    )
}

function DeleteButton() {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/user/delete-request', {
                method: 'POST'
            })
            if (res.ok) {
                setSent(true)
            } else {
                alert('Fehler beim Senden der Anfrage.')
            }
        } catch (error) {
            console.error(error)
            alert('Ein Fehler ist aufgetreten.')
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="text-green-600 font-medium flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-1" />
                E-Mail gesendet!
            </div>
        )
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
        >
            {loading ? 'Sende...' : 'E-Mail anfordern'}
        </button>
    )
}



interface PushNotificationToggleProps {
    settings: {
        daily: boolean
        features: boolean
        weekly: boolean
    }
    onChange: (key: string, value: boolean) => void
}

function PushNotificationToggle({ settings, onChange }: PushNotificationToggleProps) {
    const { isSupported, isSubscribed, subscribe, unsubscribe, loading, permissionState, isIOS, isStandalone } = useWebPush()

    if (!isSupported) {
        if (isIOS && !isStandalone) {
            return (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-2">Push-Benachrichtigungen auf iOS</p>
                    <p className="text-sm text-blue-600">
                        Um Benachrichtigungen zu aktivieren, musst du diese App zum Home-Bildschirm hinzufügen.
                    </p>
                    <ul className="text-sm text-blue-600 list-disc ml-5 mt-2 space-y-1">
                        <li>Tippe unten auf den <span className="font-bold">Teilen-Knopf</span></li>
                        <li>Wähle <span className="font-bold">"Zum Home-Bildschirm"</span></li>
                    </ul>
                </div>
            )
        }
        return <p className="text-sm text-gray-500">Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.</p>
    }

    if (permissionState === 'denied') {
        return <p className="text-sm text-red-500">Benachrichtigungen sind blockiert. Bitte in den Browsereinstellungen aktivieren.</p>
    }

    const handleToggle = async () => {
        if (isSubscribed) {
            await unsubscribe()
        } else {
            await subscribe()
        }
    }

    return (
        <div className="space-y-4">
            <div id="tour-notifications" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                    {isSubscribed ? (
                        <BellIcon className="w-6 h-6 text-primary-600" />
                    ) : (
                        <BellSlashIcon className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Push-Benachrichtigungen</h4>
                        <p className="text-xs text-gray-500">
                            {isSubscribed ? 'Aktiviert' : 'Deaktiviert'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${isSubscribed ? 'bg-primary-600' : 'bg-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSubscribed ? 'translate-x-5' : 'translate-x-0'
                            }`}
                    />
                </button>
                {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div></div>}
            </div>

            {isSubscribed && (
                <div className="pl-4 space-y-3 animate-in fade-in slide-in-from-top-2 border-l-2 border-gray-100 ml-4">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={settings.daily}
                            onChange={(e) => onChange('notifyDaily', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 transition-colors"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700 block">Tägliche Erinnerung</span>
                            <span className="text-xs text-gray-500">Erinnerung an dein tägliches Quiz</span>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={settings.features}
                            onChange={(e) => onChange('notifyFeatures', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 transition-colors"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700 block">Neuigkeiten & Features</span>
                            <span className="text-xs text-gray-500">Infos über neue Kurse und Updates</span>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={settings.weekly}
                            onChange={(e) => onChange('notifyWeekly', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 transition-colors"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700 block">Wöchentliche Zusammenfassung</span>
                            <span className="text-xs text-gray-500">Dein Fortschritt im Überblick</span>
                        </div>
                    </label>
                </div>
            )}
        </div>
    )
}
