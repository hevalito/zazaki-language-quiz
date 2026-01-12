"use client"

import { useEffect, useState } from 'react'
import { pwaInstallHandler } from 'pwa-install-handler'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/use-translation'

interface InstallPromptProps {
    attemptCount: number
}

export function InstallPrompt({ attemptCount }: InstallPromptProps) {
    const { t } = useTranslation()
    const [canInstall, setCanInstall] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check initial state
        setCanInstall(pwaInstallHandler.canInstall())

        // Add listener for state changes
        const updateState = (installable: boolean) => {
            setCanInstall(installable)
        }
        pwaInstallHandler.addListener(updateState)

        return () => pwaInstallHandler.removeListener(updateState)
    }, [])

    useEffect(() => {
        // Show prompt logic
        const dismissed = localStorage.getItem('zazaki-pwa-dismissed')
        if (!dismissed && attemptCount >= 1 && canInstall) {
            setIsVisible(true)
        }
    }, [attemptCount, canInstall])

    const handleInstall = async () => {
        try {
            const installed = await pwaInstallHandler.install()
            if (installed) {
                setIsInstalled(true)
                setIsVisible(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('zazaki-pwa-dismissed', 'true')
    }

    if (!isVisible || !canInstall) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between max-w-md mx-auto">
                <div className="flex-1 mr-4">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <ArrowDownTrayIcon className="w-5 h-5 text-brand-orange mr-2" />
                        {t('pwa.install.title', 'App installieren')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('pwa.install.desc', 'Installiere Zazakî Quiz für schnellen Zugriff und Offline-Modus!')}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleInstall}
                        className="btn-primary py-2 px-4 shadow-lg shadow-brand-orange/20"
                    >
                        {t('pwa.install.button', 'Installieren')}
                    </button>
                </div>
            </div>
        </div>
    )
}
