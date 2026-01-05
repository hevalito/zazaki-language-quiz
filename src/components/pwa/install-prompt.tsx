"use client"

import { useEffect, useState } from 'react'
import * as pwaInstallHandlerModule from 'pwa-install-handler'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface InstallPromptProps {
    attemptCount: number
}

export function InstallPrompt({ attemptCount }: InstallPromptProps) {
    const [canInstall, setCanInstall] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    // Handle ESM/CJS interop
    const pwaInstallHandler = (pwaInstallHandlerModule as any).default || pwaInstallHandlerModule

    useEffect(() => {
        // Check if installable
        if (pwaInstallHandler.getPWAInstallState && pwaInstallHandler.getPWAInstallState()) {
            setCanInstall(true)
        }

        // Also check if already dismissed
        const dismissed = localStorage.getItem('zazaki-pwa-dismissed')
        if (!dismissed && attemptCount >= 1) {
            if (pwaInstallHandler.getPWAInstallState && pwaInstallHandler.getPWAInstallState()) {
                setIsVisible(true)
            }
        }
    }, [attemptCount, pwaInstallHandler])

    const handleInstall = async () => {
        try {
            if (pwaInstallHandler.install) {
                const installed = await pwaInstallHandler.install()
                if (installed) {
                    setIsInstalled(true)
                    setIsVisible(false)
                }
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
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 flex items-center justify-between max-w-md mx-auto">
                <div className="flex-1 mr-4">
                    <h4 className="font-bold text-gray-900 flex items-center">
                        <ArrowDownTrayIcon className="w-5 h-5 text-brand-orange mr-2" />
                        App installieren
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                        Installiere Zazakî Quiz für schnellen Zugriff und Offline-Modus!
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleInstall}
                        className="btn-primary py-2 px-4 shadow-lg shadow-brand-orange/20"
                    >
                        Installieren
                    </button>
                </div>
            </div>
        </div>
    )
}
