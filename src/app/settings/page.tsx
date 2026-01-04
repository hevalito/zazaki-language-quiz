"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    UserCircleIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    CameraIcon
} from '@heroicons/react/24/outline'

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
        dailyGoal: 50,
        preferredScript: 'LATIN'
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
                    dailyGoal: data.dailyGoal || 50,
                    preferredScript: data.preferredScript || 'LATIN'
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
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
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
                        <p className="mt-3 text-sm text-gray-500 font-medium">Click to change avatar</p>
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
                            </select>
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
                </div>
            </main>
        </div>
    )
}
