"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function OnboardingPage() {
    const router = useRouter()
    const { update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nickname: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                throw new Error('Failed to save profile')
            }

            // Update session to reflect new data
            await update({
                user: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    nickname: formData.nickname
                }
            })

            router.push('/')
            router.refresh()
        } catch (err) {
            setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                        <Image
                            src="/images/logo-full.png"
                            alt="Zazakî Quiz"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-serif font-bold text-gray-900">
                        Willkommen bei Zazakî!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 max-w-sm">
                        Um dein Zertifikat später personalisieren zu können, benötigen wir deinen Namen.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-1 font-sans">
                                    Vorname
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Max"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-1 font-sans">
                                    Nachname
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Mustermann"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 italic text-center">
                            * Dein echter Name wird <strong>niemals öffentlich</strong> angezeigt. Er dient nur für deine Urkunden.
                        </p>

                        <div className="pt-2">
                            <label htmlFor="nickname" className="block text-sm font-bold text-gray-700 mb-1 font-sans">
                                Nickname (Öffentlich)
                            </label>
                            <input
                                id="nickname"
                                name="nickname"
                                type="text"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="z.B. ZazakîMeister24"
                                value={formData.nickname}
                                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Dieser Name wird auf der Bestenliste angezeigt.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                    >
                        {isLoading ? 'Speichern...' : 'Profil erstellen & Loslegen'}
                    </button>
                </form>
            </div>
        </div>
    )
}
