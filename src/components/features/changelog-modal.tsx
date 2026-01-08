"use client"

import { useState, useEffect } from 'react'
import { XMarkIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'

// Configuration for the current release
const CURRENT_RELEASE = {
    version: "2.3.0",
    title: "Der Lernraum ist da! 🎓",
    description: "Übung macht den Meister! Im neuen Lernraum kannst du gezielt deine Fehler aus vergangenen Quizzen wiederholen. Deine persönlichen Schwachstellen werden so zu deinen Stärken.",
    ctaText: "Jetzt ausprobieren",
    ctaLink: "/learning",
    featureIcon: SparklesIcon
}

export function ChangelogModal() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('zazaki-changelog-version')

        // Show if version changed or never seen
        if (lastSeenVersion !== CURRENT_RELEASE.version) {
            // Small delay to not clash with other startup animations
            const timer = setTimeout(() => {
                setIsOpen(true)
                // Fire confetti for major updates
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4F46E5', '#10B981', '#F59E0B']
                })
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem('zazaki-changelog-version', CURRENT_RELEASE.version)
    }

    const handleAction = () => {
        handleClose()
        if (CURRENT_RELEASE.ctaLink) {
            router.push(CURRENT_RELEASE.ctaLink)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600" />

                        {/* Content Container */}
                        <div className="relative px-6 pt-12 pb-6">
                            {/* Icon Bubble */}
                            <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3">
                                <CURRENT_RELEASE.featureIcon className="w-10 h-10 text-indigo-600" />
                            </div>

                            {/* Text Content */}
                            <div className="text-center space-y-4">
                                <div className="space-y-1">
                                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                                        Neu in v{CURRENT_RELEASE.version}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                                        {CURRENT_RELEASE.title}
                                    </h2>
                                </div>

                                <p className="text-gray-600 leading-relaxed">
                                    {CURRENT_RELEASE.description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={handleAction}
                                    className="w-full btn-primary py-3 flex items-center justify-center text-base shadow-lg shadow-indigo-200"
                                >
                                    {CURRENT_RELEASE.ctaText}
                                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                                </button>

                                <button
                                    onClick={handleClose}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                                >
                                    Schließen
                                </button>
                            </div>
                        </div>

                        {/* Close Button Top Right */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
