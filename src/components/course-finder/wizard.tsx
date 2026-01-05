'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COURSE_FINDER_FLOW, FlowNode } from '@/lib/course-finder-flow'
import { ArrowRightIcon, ArrowPathIcon, CheckBadgeIcon, MapIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import confetti from 'canvas-confetti'
import Image from 'next/image'

export default function CourseFinderWizard() {
    const router = useRouter()
    const { data: session } = useSession()
    const [currentNodeId, setCurrentNodeId] = useState<string>('n1')
    const [history, setHistory] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    const currentNode = COURSE_FINDER_FLOW[currentNodeId]

    const handleOptionClick = (nextId: string) => {
        setHistory(prev => [...prev, currentNodeId])
        setCurrentNodeId(nextId)
    }

    const handleBack = () => {
        if (history.length === 0) return
        const prevId = history[history.length - 1]
        setHistory(prev => prev.slice(0, -1))
        setCurrentNodeId(prevId)
    }

    const handleSaveResult = async () => {
        if (!currentNode.result) return

        // Trigger confetti
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#febd11', '#278e43', '#d0021b']
        })

        if (!session?.user) {
            // Store result in localStorage before redirecting to auth
            localStorage.setItem('courseFinderResult', JSON.stringify(currentNode.result))
            router.push('/auth/signup?callbackUrl=/dashboard')
            return
        }

        setSaving(true)
        try {
            await fetch('/api/user/course-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    result: currentNode.result,
                    history: [...history, currentNodeId]
                })
            })
            // Redirect to dashboard
            router.push('/dashboard')
        } catch (error) {
            console.error('Failed to save result', error)
        } finally {
            setSaving(false)
        }
    }

    const isResult = currentNode.type === 'result'

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col relative">

                {/* Progress Bar - Brand Primary */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary-50">
                    <div
                        className="h-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${Math.min((history.length + 1) * 15, 100)}%` }}
                    />
                </div>

                {/* History Breadcrumb (Visualizing Progress) */}
                {history.length > 0 && (
                    <div className="px-8 pt-8 flex flex-wrap gap-2">
                        {history.map((nodeId, idx) => {
                            const node = COURSE_FINDER_FLOW[nodeId]
                            // Don't show every step if it's too long, maybe just regions?
                            // For now, simple dots or small text?
                            // Let's show small chips
                            if (node.type === 'question' && history.length > 2 && idx < history.length - 2) return null // Hide old history
                            return (
                                <span key={nodeId} className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full flex items-center">
                                    <CheckBadgeIcon className="w-3 h-3 mr-1" />
                                    {idx === 0 ? 'Start' : '...'}
                                </span>
                            )
                        })}
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center scroll-smooth">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentNodeId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full max-w-xl"
                        >
                            {isResult ? (
                                <div className="space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary-100/50 rounded-full blur-3xl transform scale-150"></div>
                                        {currentNode.image ? (
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white mx-auto mb-6">
                                                <Image
                                                    src={currentNode.image}
                                                    alt="Region Map"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce-subtle">
                                                <SparklesIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-2">Dein Ergebnis</h2>
                                        <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                                            {currentNode.result?.recommendation}
                                        </h3>
                                        <p className="text-gray-500 font-sans max-w-md mx-auto leading-relaxed">
                                            Wir haben basierend auf deinen Antworten den perfekten Kurs für dich gefunden.
                                            {currentNode.result?.dialect && ` Dein Fokus liegt auf dem ${currentNode.result.dialect} Dialekt.`}
                                        </p>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={handleSaveResult}
                                            disabled={saving}
                                            className="w-full sm:w-auto px-10 py-4 bg-primary-500 text-gray-900 rounded-2xl font-bold text-lg hover:bg-primary-400 transition-all shadow-xl shadow-primary-500/20 hover:-translate-y-1 flex items-center justify-center mx-auto"
                                        >
                                            {saving ? 'Wird gespeichert...' : 'Kurs jetzt starten'}
                                            {!saving && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                                        </button>
                                        {!session?.user && (
                                            <p className="text-xs text-gray-400 mt-4">
                                                Kostenlos registrieren, um Fortschritt zu speichern.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                                            {currentNode.text}
                                        </h2>

                                        {/* Dynamic Image for Info/Question Nodes (e.g. Map placeholders) */}
                                        {currentNode.image && (
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100 my-6">
                                                <Image
                                                    src={currentNode.image}
                                                    alt="Region Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-4">
                                        {currentNode.options?.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(option.nextId)}
                                                className="group w-full p-5 text-left bg-white border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50/30 rounded-2xl transition-all font-medium text-lg text-gray-700 hover:text-gray-900 flex justify-between items-center shadow-sm hover:shadow-md"
                                            >
                                                <span>{option.label}</span>
                                                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-500 flex items-center justify-center transition-colors">
                                                    <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
                    {history.length > 0 ? (
                        <button
                            onClick={handleBack}
                            className="text-gray-400 hover:text-gray-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors uppercase tracking-wider"
                        >
                            Zurück
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {history.length > 0 && !isResult && (
                        <button
                            onClick={() => {
                                setHistory([])
                                setCurrentNodeId('n1')
                            }}
                            className="text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors uppercase tracking-wider"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Neustart
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
