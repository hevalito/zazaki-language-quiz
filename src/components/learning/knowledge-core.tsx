'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/solid'

interface KnowledgeCoreProps {
    percentage: number
    size?: 'sm' | 'md' | 'lg' | 'xl'
    animate?: boolean
    showLabel?: boolean
    onClick?: () => void
}

export function KnowledgeCore({
    percentage,
    size = 'lg',
    animate = true,
    showLabel = true,
    onClick
}: KnowledgeCoreProps) {
    const [displayValue, setDisplayValue] = useState(0)

    // Calculate dimensions based on size
    const sizes = {
        sm: { size: 60, stroke: 4, fontSize: 'text-xs' },
        md: { size: 120, stroke: 8, fontSize: 'text-2xl' },
        lg: { size: 200, stroke: 12, fontSize: 'text-5xl' },
        xl: { size: 300, stroke: 16, fontSize: 'text-7xl' }
    }

    const { size: dimension, stroke, fontSize } = sizes[size]
    const radius = (dimension - stroke) / 2
    const circumference = 2 * Math.PI * radius

    // Clamp percentage 0-100
    const safePercentage = Math.min(Math.max(percentage, 0), 100)
    const strokeDashoffset = circumference - (safePercentage / 100) * circumference

    // Count up animation for number text
    useEffect(() => {
        if (!animate) {
            setDisplayValue(safePercentage)
            return
        }

        // Simple ease-out counter
        let start = 0
        const duration = 1500
        const startTime = performance.now()

        const update = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3)

            setDisplayValue(start + (safePercentage - start) * ease)

            if (progress < 1) {
                requestAnimationFrame(update)
            }
        }

        requestAnimationFrame(update)
    }, [safePercentage, animate])

    return (
        <div
            className={`relative flex flex-col items-center justify-center ${onClick ? 'cursor-pointer group' : ''}`}
            onClick={onClick}
            style={{ width: dimension, height: showLabel ? dimension + 40 : dimension }}
        >
            {/* The Ring */}
            <div className="relative" style={{ width: dimension, height: dimension }}>
                {/* Background Track */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        className="text-gray-100 dark:text-gray-800"
                    />
                    {/* Progress Circle (Glow Layer) */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className="text-blue-500/30 blur-sm"
                    />
                    {/* Progress Circle (Sharp Layer) */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        stroke="url(#gradient)" // Use gradient definition
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
                            <stop offset="100%" stopColor="#eab308" /> {/* Yellow-500/Gold */}
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-bold tabular-nums text-gray-900 ${fontSize} leading-none`}>
                        {displayValue.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Label Below */}
            {showLabel && (
                <div className="mt-4 text-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1">
                        <SparklesIcon className="w-4 h-4 text-yellow-500" />
                        Total Knowledge
                    </span>
                </div>
            )}
        </div>
    )
}
