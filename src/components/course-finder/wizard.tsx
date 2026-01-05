'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COURSE_FINDER_FLOW, FlowNode } from '@/lib/course-finder-flow'
import { ArrowRightIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import confetti from 'canvas-confetti'

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
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
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
            // Redirect to dashboard or show success
            router.push('/dashboard')
        } catch (error) {
            console.error('Failed to save result', error)
        } finally {
            setSaving(false)
        }
    }

    const isResult = currentNode.type === 'result'

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[400px] flex flex-col relative">

                {/* Progress / Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min((history.length + 1) * 15, 100)}%` }}
                    />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentNodeId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {isResult ? (
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircleIcon className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Dein perfekter Kurs:</h2>
                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                        <h3 className="text-3xl font-extrabold text-indigo-700 mb-2">
                                            {currentNode.result?.recommendation}
                                        </h3>
                                        {currentNode.result?.dialect && (
                                            <p className="text-indigo-600 font-medium">
                                                Dialekt: {currentNode.result.dialect}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSaveResult}
                                            disabled={saving}
                                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center mx-auto"
                                        >
                                            {saving ? 'Wird gespeichert...' : 'Kurs starten & Speichern'}
                                            {!saving && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                                        </button>
                                        {!session?.user && (
                                            <p className="text-sm text-gray-500 mt-4">
                                                Erstelle ein kostenloses Konto, um deinen Fortschritt zu speichern.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                        {currentNode.text}
                                    </h2>

                                    <div className="grid gap-3">
                                        {currentNode.options?.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(option.nextId)}
                                                className="w-full p-4 text-left bg-gray-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 rounded-xl transition-all font-medium text-gray-700 hover:text-indigo-700 flex justify-between items-center group"
                                            >
                                                <span>{option.label}</span>
                                                <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
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
                            className="text-gray-400 hover:text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                            className="text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-1" />
                            Neustart
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
