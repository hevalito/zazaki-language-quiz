"use client"

import { useState, useEffect } from 'react'
import { useUnlockStore } from '@/lib/store/unlock-store'
import { XMarkIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import confetti from 'canvas-confetti'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function AchievementUnlockModal() {
    const { unlockQueue, popBadge } = useUnlockStore()
    const [isOpen, setIsOpen] = useState(false)
    const [animationState, setAnimationState] = useState<'closed' | 'shaking' | 'opening' | 'revealed'>('closed')
    const router = useRouter()

    const activeBadge = unlockQueue[0]

    useEffect(() => {
        if (activeBadge) {
            setIsOpen(true)
            setAnimationState('closed')
        } else {
            setIsOpen(false)
        }
    }, [activeBadge])

    const handleOpen = () => {
        if (animationState !== 'closed') return

        setAnimationState('shaking')

        // Shake for 800ms
        setTimeout(() => {
            setAnimationState('opening')

            // Explosion point!
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500']
            })

            // Reveal shortly after
            setTimeout(() => {
                setAnimationState('revealed')
            }, 300)

        }, 800)
    }

    const handleViewDetails = () => {
        setIsOpen(false)
        popBadge()
        router.push(`/achievements/${activeBadge.id}`)
    }

    const handleClose = () => {
        setIsOpen(false)
        // Wait for close animation if we had one, but strict pop:
        popBadge()
    }

    if (!isOpen || !activeBadge) return null

    const getBadgeTitle = (title: any) => {
        if (typeof title === 'string') return title
        return title?.de || title?.en || 'Erfolg'
    }

    const getBadgeDescription = (desc: any) => {
        if (typeof desc === 'string') return desc
        return desc?.de || desc?.en || ''
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="max-w-md w-full relative">

                {/* Close Button (only allowed if revealed) */}
                {animationState === 'revealed' && (
                    <button
                        onClick={handleClose}
                        className="absolute -top-12 right-0 text-white/50 hover:text-white p-2"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                )}

                <div className="text-center">

                    {/* STAGE 1: THE CRATE */}
                    {(animationState === 'closed' || animationState === 'shaking' || animationState === 'opening') && (
                        <div
                            onClick={handleOpen}
                            className={`cursor-pointer transition-transform duration-100 ${animationState === 'shaking' ? 'animate-shake' : 'hover:scale-105'
                                } ${animationState === 'opening' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}
                        >
                            <div className="w-48 h-48 mx-auto bg-gradient-to-b from-yellow-400 to-orange-600 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.4)] flex items-center justify-center border-4 border-yellow-200 border-b-8 mb-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
                                <div className="text-6xl filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all">
                                    🎁
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <div className={`mt-8 space-y-2 transition-opacity duration-300 ${animationState === 'opening' ? 'opacity-0' : 'opacity-100'}`}>
                                <h3 className="text-2xl font-bold text-white text-shadow-sm">Neuer Erfolg!</h3>
                                <p className="text-white/80 animate-pulse">Tippen zum Öffnen</p>
                            </div>
                        </div>
                    )}

                    {/* STAGE 2: THE REVEAL */}
                    {animationState === 'revealed' && (
                        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-50 duration-500 text-center relative overflow-hidden">
                            {/* Background Rays */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 to-orange-50 -z-10"></div>

                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-orange to-red-500 rounded-full flex items-center justify-center shadow-lg mb-6 ring-4 ring-orange-100 animate-bounce-subtle">
                                {/* Placeholder for Icon URL check */}
                                {activeBadge.iconUrl && (activeBadge.iconUrl.startsWith('http') || activeBadge.iconUrl.startsWith('/')) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={activeBadge.iconUrl} alt="Badge" className="w-16 h-16 object-contain invert-0 brightness-0 invert" />
                                ) : activeBadge.iconUrl ? (
                                    <span className="text-6xl filter brightness-0 invert" role="img" aria-label={getBadgeTitle(activeBadge.title)}>
                                        {activeBadge.iconUrl}
                                    </span>
                                ) : (
                                    <SparklesIcon className="w-16 h-16 text-white" />
                                )}
                            </div>

                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                                {getBadgeTitle(activeBadge.title)}
                            </h2>
                            <p className="text-gray-600 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                                {getBadgeDescription(activeBadge.description)}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleViewDetails}
                                    className="btn-primary w-full py-3 text-lg shadow-lg shadow-brand-orange/20 flex items-center justify-center group"
                                >
                                    Ansehen
                                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-600 text-sm font-medium py-2"
                                >
                                    Schließen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
