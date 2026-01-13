"use client"

import { useState } from 'react'
import { BeakerIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface DebugProps {
    data: {
        reason: string
        currentStage: number
        nextReviewCorrect: string
        nextReviewWrong: string
    }
}

export function LearningDebugPanel({ data }: DebugProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!data) return null

    // Format helpers
    const formatDate = (iso: string) => {
        const d = new Date(iso)
        // If date is epoch 0 (1970) or very close to now (mistake), show readable
        if (d.getFullYear() === 1970) return 'Immediate (Now)'

        // Relative logic
        const now = new Date()
        const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (diffHours <= 0) return 'Immediate (Now)'
        if (diffHours < 24) return `+${Math.round(diffHours)}h (${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`

        const diffDays = Math.ceil(diffHours / 24)
        return `+${diffDays} days (${d.toLocaleDateString()})`
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-black/80 backdrop-blur-md text-white rounded-lg shadow-2xl border border-white/10 max-w-sm overflow-hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-3 text-xs font-mono hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <BeakerIcon className="w-4 h-4" />
                        <span className="font-bold">ADMIN DEBUG</span>
                    </div>
                    {isOpen ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronUpIcon className="w-3 h-3" />}
                </button>

                {isOpen && (
                    <div className="p-4 pt-0 text-xs font-mono space-y-3 border-t border-white/10">
                        <div>
                            <span className="text-gray-400 block mb-0.5">Selection Reason</span>
                            <span className="text-green-300 font-bold">{data.reason}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-400 block mb-0.5">Current Stage</span>
                                <span className="text-blue-300 font-bold text-lg">{data.currentStage}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                            <div>
                                <span className="text-gray-400 block mb-0.5">If Correct ➔</span>
                                <span className="text-green-300">{formatDate(data.nextReviewCorrect)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5">If Wrong ➔</span>
                                <span className="text-red-300">{formatDate(data.nextReviewWrong)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
