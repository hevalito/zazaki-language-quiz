"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { signOut } from 'next-auth/react'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/use-translation'

function DeleteConfirmContent() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const handleConfirm = async () => {
        if (!token) return

        setStatus('loading')
        try {
            const res = await fetch('/api/user/delete-confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                // Force client-side signout to clear cookies/session
                await signOut({ callbackUrl: '/' })
            } else {
                setStatus('error')
                setErrorMessage(data.error || t('common.error', 'Ein Fehler ist aufgetreten.'))
            }
        } catch (error) {
            setStatus('error')
            setErrorMessage(t('common.connectionError', 'Verbindungsfehler.'))
        }
    }

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-red-600">{t('delete.token.invalid', 'Ungültiger Link (Kein Token).')}</p>
                <button onClick={() => router.push('/')} className="mt-4 btn-secondary">
                    {t('common.backToHome', 'Zur Startseite')}
                </button>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t('delete.success.title', 'Konto gelöscht')}</h1>
                <p className="text-gray-600">
                    {t('delete.success.message', 'Schade, dass du gehst. Wir haben dir eine Abschieds-E-Mail gesendet.')}
                </p>
                <p className="text-sm text-gray-400">{t('delete.success.redirect', 'Du wirst gleich weitergeleitet...')}</p>
            </div>
        )
    }

    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{t('delete.confirm.title', 'Endgültige Bestätigung')}</h1>

            <p className="text-gray-600 max-w-sm mx-auto">
                {t('delete.confirm.message', 'Möchtest du dein Konto wirklich unwiderruflich löschen? Alle Daten gehen verloren.')}
            </p>

            {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {errorMessage}
                </div>
            )}

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center pt-2">
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                    disabled={status === 'loading'}
                >
                    {t('common.cancel', 'Abbrechen')}
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={status === 'loading'}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50 flex items-center justify-center"
                >
                    {status === 'loading' ? t('delete.deleting', 'Lösche...') : t('delete.confirm.button', 'Ja, Konto löschen')}
                </button>
            </div>
        </div>
    )
}

export default function DeleteConfirmPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Suspense fallback={<div>Lade...</div>}>
                        <DeleteConfirmContent />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
