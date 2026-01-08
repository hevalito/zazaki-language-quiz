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
import { useTranslation } from '@/hooks/use-translation'

export default function CourseFinderWizard() {
    const { t } = useTranslation()
    const router = useRouter()
    const { data: session } = useSession()
    const [currentNodeId, setCurrentNodeId] = useState<string>('n1')
    const [history, setHistory] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [calculating, setCalculating] = useState(false)
    const [email, setEmail] = useState('')
    const [showEmailInput, setShowEmailInput] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const currentNode = COURSE_FINDER_FLOW[currentNodeId]

    const handleOptionClick = (nextId: string) => {
        const nextNode = COURSE_FINDER_FLOW[nextId]

        if (nextNode?.type === 'result') {
            if (!session?.user && !showEmailInput) {
                // If guest, show email input first (don't navigate yet)
                // We keep the Result ID pending basically?
                // Or better: We go to a "pre-result" state?
                // Actually, the user wants: "one step before we show the results"
                // So when they click the option that LEADS to result, we intercept.
                // Show "Calculating..." -> Then Email Input -> Then Result (but Result is hidden behind Email/Login)

                setCalculating(true)
                setTimeout(() => {
                    setCalculating(false)
                    setShowEmailInput(true)
                    // We DO NOT advance currentNodeId yet. We stay on the question but show overlay?
                    // Or we advance to result but render Email Input instead of Result Card?
                    // Let's advance to result ID, but `isResult` block handles the view mode.
                    setHistory(prev => [...prev, currentNodeId])
                    setCurrentNodeId(nextId)
                }, 1500)
            } else {
                setCalculating(true)
                setTimeout(() => {
                    setCalculating(false)
                    setHistory(prev => [...prev, currentNodeId])
                    setCurrentNodeId(nextId)
                }, 1500)
            }
        } else {
            setHistory(prev => [...prev, currentNodeId])
            setCurrentNodeId(nextId)
        }
    }

    const handleBack = () => {
        if (showEmailInput) {
            setShowEmailInput(false)
            // Go back to previous question
            const prevId = history[history.length - 1]
            setHistory(prev => prev.slice(0, -1))
            setCurrentNodeId(prevId)
            return
        }
        if (history.length === 0) return
        const prevId = history[history.length - 1]
        setHistory(prev => prev.slice(0, -1))
        setCurrentNodeId(prevId)
    }

    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setSaving(true)

        try {
            // 1. Save data via API
            await fetch('/api/course-finder/guest-save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    result: currentNode.result,
                    history: [...history, currentNodeId]
                })
            })

            // 2. Trigger Magic Link Login
            // This sends the "Login" email. The "Result" email was sent by guest-save.
            const { signIn } = await import("next-auth/react")
            await signIn("resend", {
                email,
                redirect: false,
                callbackUrl: '/dashboard?courseFinderSuccess=true' // Triggers custom email in auth.ts
            })

            setEmailSent(true)
            // Confetti for success!
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#febd11', '#278e43', '#d0021b']
            })

        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
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
            // Should not happen here ideally if flow works, but fallback
            setShowEmailInput(true)
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

            // Redirect logic: Existing users -> Dashboard/Home. New users -> Onboarding (handled by Onboarding flow usually)
            // User requested: "IF existing quiz users access the course finder ... gets back to the quiz root page"
            router.push('/dashboard')
        } catch (error) {
            console.error('Failed to save result', error)
        } finally {
            setSaving(false)
        }
    }

    const isResult = currentNode.type === 'result'

    // GUEST FLOW VIEW (Email Input)
    if (isResult && !session?.user && showEmailInput) {
        if (emailSent) {
            return (
                <div className="w-full max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce-subtle">
                            <CheckBadgeIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">{t('courseFinder.success.title', 'Ergebnis gespeichert!')}</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                            {t('courseFinder.success.message', 'Wir haben dir eine E-Mail mit deinem Ergebnis und einem Link zum Anmelden gesendet.')}
                        </p>
                        <p className="text-sm text-gray-400">
                            {t('courseFinder.success.checkMail', 'Bitte überprüfe dein Postfach')} ({email}).
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                    <button onClick={handleBack} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600">
                        <ArrowPathIcon className="w-6 h-6 rotate-180" /> {/* Back Icon */}
                    </button>

                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{t('courseFinder.email.title', 'Fast geschafft!')}</h2>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                        {t('courseFinder.email.subtitle', 'Gib deine E-Mail-Adresse ein, um dein persönliches Kursergebnis zu speichern und direkt loszulegen.')}
                    </p>

                    <form onSubmit={handleGuestSubmit} className="w-full max-w-md space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="deine@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 text-lg outline-none transition-all placeholder:text-gray-300"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 bg-primary-500 text-gray-900 rounded-xl font-bold text-lg hover:bg-primary-400 transition-all flex justify-center items-center shadow-lg shadow-primary-500/20"
                        >
                            {saving ? (
                                <ArrowPathIcon className="w-6 h-6 animate-spin" />
                            ) : (
                                t('courseFinder.email.submit', 'Ergebnis ansehen')
                            )}
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-6 max-w-xs">
                        {t('courseFinder.email.disclaimer', 'Mit dem Klick auf "Ergebnis ansehen" stimmst du unseren Nutzungsbedingungen zu.')}
                    </p>
                </div>
            </div>
        )
    }

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
                {history.length > 0 && !calculating && !showEmailInput && ( // Hide history on result mainly
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
                                    {idx === 0 ? t('common.start', 'Start') : '...'}
                                </span>
                            )
                        })}
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center scroll-smooth">
                    <AnimatePresence mode="wait">
                        {calculating ? (
                            <motion.div
                                key="calculating"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="w-24 h-24 relative mb-6">
                                    <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                                    <SparklesIcon className="absolute inset-0 w-10 h-10 text-primary-500 m-auto animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 animate-pulse">
                                    {t('courseFinder.calculating.title', 'Ergebnis wird berechnet...')}
                                </h3>
                                <p className="text-gray-500 mt-2">{t('courseFinder.calculating.subtitle', 'Wir suchen den perfekten Kurs für dich.')}</p>
                            </motion.div>
                        ) : (
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
                                            <h2 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-2">{t('courseFinder.result.yourResult', 'Dein Ergebnis')}</h2>
                                            <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                                                {t(currentNode.result?.recommendation || '', currentNode.result?.recommendation)}
                                            </h3>
                                            <p className="text-gray-500 font-sans max-w-md mx-auto leading-relaxed">
                                                {t('courseFinder.result.explanation', 'Wir haben basierend auf deinen Antworten den perfekten Kurs für dich gefunden.')}
                                                {currentNode.result?.dialect && ` ${t('courseFinder.result.focus', 'Dein Fokus liegt auf dem')} ${t(currentNode.result.dialect, currentNode.result.dialect)} ${t('courseFinder.result.dialectSuffix', 'Dialekt')}.`}
                                            </p>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                onClick={handleSaveResult}
                                                disabled={saving}
                                                className="w-full sm:w-auto px-10 py-4 bg-primary-500 text-gray-900 rounded-2xl font-bold text-lg hover:bg-primary-400 transition-all shadow-xl shadow-primary-500/20 hover:-translate-y-1 flex items-center justify-center mx-auto"
                                            >
                                                {saving ? t('common.saving', 'Wird gespeichert...') : t('courseFinder.result.backToOverview', 'Zurück zur Übersicht')}
                                                {!saving && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                                                {t(currentNode.text, currentNode.text)}
                                            </h2>

                                            {/* Description Text */}
                                            {currentNode.description && (
                                                <p className="text-lg text-gray-600 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 inline-block">
                                                    {t(currentNode.description, currentNode.description)}
                                                </p>
                                            )}

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
                                                    <span>{t(option.label, option.label)}</span>
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-500 flex items-center justify-center transition-colors">
                                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
                    {history.length > 0 && !calculating ? (
                        <button
                            onClick={handleBack}
                            className="text-gray-400 hover:text-gray-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors uppercase tracking-wider"
                        >
                            {t('common.back', 'Zurück')}
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {history.length > 0 && !isResult && !calculating && (
                        <button
                            onClick={() => {
                                setHistory([])
                                setCurrentNodeId('n1')
                            }}
                            className="text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors uppercase tracking-wider"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            {t('common.restart', 'Neustart')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
