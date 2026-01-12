'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import {
    ChatBubbleBottomCenterTextIcon,
    XMarkIcon,
    BugAntIcon,
    LightBulbIcon,
    LifebuoyIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'

type FeedbackType = 'BUG' | 'FEATURE' | 'SUPPORT' | 'OTHER'

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useTranslation()

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-[60] p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 group md:bottom-8 md:right-8"
                aria-label={t('feedback.widget.label', 'Feedback geben')}
            >
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('feedback.widget.tooltip', 'Feedback geben')}
                </span>
            </button>

            <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}

function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname()
    const { t } = useTranslation()
    const [type, setType] = useState<FeedbackType | null>(null)
    const [message, setMessage] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState<'TYPE' | 'DETAILS' | 'SUCCESS'>('TYPE')

    const reset = () => {
        setType(null)
        setMessage('')
        setEmail('')
        setStep('TYPE')
        setIsSubmitting(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!type || !message) return

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message,
                    pageUrl: pathname,
                    userEmail: email || undefined,
                    deviceInfo: {
                        userAgent: navigator.userAgent,
                        screenSize: `${window.innerWidth}x${window.innerHeight}`,
                    }
                })
            })

            if (!response.ok) throw new Error('Failed to submit')

            // Show success step instead of closing immediately
            setStep('SUCCESS')
            setTimeout(() => {
                onClose()
                setTimeout(reset, 300)
            }, 2000)
        } catch (error) {
            toast.error(t('feedback.error.toast', 'Fehler beim Senden. Bitte versuche es später erneut.'))
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
        setTimeout(reset, 300)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog static open={isOpen} onClose={handleClose} className="relative z-[100]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel
                            as={motion.div}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600" />

                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            <div className="relative px-6 pt-8 pb-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {step === 'TYPE' && t('feedback.modal.title', 'Feedback geben')}
                                        {step === 'DETAILS' && t('feedback.modal.details.title', 'Details')}
                                        {step === 'SUCCESS' && t('feedback.modal.success.title', 'Vielen Dank!')}
                                    </h2>
                                    <p className="text-indigo-100">
                                        {step === 'TYPE' && t('feedback.modal.subtitle', 'Worum geht es bei deinem Feedback?')}
                                        {step === 'DETAILS' && t('feedback.modal.details.subtitle', 'Erzähl uns mehr darüber.')}
                                        {step === 'SUCCESS' && t('feedback.modal.success.subtitle', 'Wir haben dein Feedback erhalten.')}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-xl pt-4 min-h-[200px] flex flex-col justify-center">
                                    {step === 'TYPE' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <TypeButton
                                                icon={BugAntIcon}
                                                label={t('feedback.type.bug', 'Fehler melden')}
                                                description={t('feedback.type.bug.desc', 'Etwas funktioniert nicht')}
                                                onClick={() => { setType('BUG'); setStep('DETAILS') }}
                                                color="text-red-600 bg-red-50 hover:bg-red-100 border-red-100"
                                            />
                                            <TypeButton
                                                icon={LightBulbIcon}
                                                label={t('feedback.type.feature', 'Idee / Wunsch')}
                                                description={t('feedback.type.feature.desc', 'Vorschlag für Features')}
                                                onClick={() => { setType('FEATURE'); setStep('DETAILS') }}
                                                color="text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100"
                                            />
                                            <TypeButton
                                                icon={LifebuoyIcon}
                                                label={t('feedback.type.support', 'Hilfe & Support')}
                                                description={t('feedback.type.support.desc', 'Ich habe eine Frage')}
                                                onClick={() => { setType('SUPPORT'); setStep('DETAILS') }}
                                                color="text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100"
                                            />
                                            <TypeButton
                                                icon={ChatBubbleBottomCenterTextIcon}
                                                label={t('feedback.type.other', 'Sonstiges')}
                                                description={t('feedback.type.other.desc', 'Allgemeines Feedback')}
                                                onClick={() => { setType('OTHER'); setStep('DETAILS') }}
                                                color="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700"
                                            />
                                        </div>
                                    ) : step === 'DETAILS' ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[120px] bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                                    placeholder={t('feedback.form.placeholder', 'Beschreibe dein Anliegen...')}
                                                    required
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('TYPE')}
                                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                                >
                                                    {t('common.back', 'Zurück')}
                                                </button>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting || !message.trim()}
                                                    className="flex-1"
                                                >
                                                    {isSubmitting ? (
                                                        t('feedback.form.sending', 'Wird gesendet...')
                                                    ) : (
                                                        <>
                                                            {t('feedback.form.submit', 'Feedback absenden')}
                                                            <PaperAirplaneIcon className="w-4 h-4 ml-2" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                                <PaperAirplaneIcon className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                {t('feedback.success.modal_title', 'Gesendet!')}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {t('feedback.success.modal_desc', 'Danke für deine Mithilfe. Wir kümmern uns darum.')}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    )
}

function TypeButton({ icon: Icon, label, description, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left ${color}`}
        >
            <Icon className="w-8 h-8 mb-3" />
            <span className="font-semibold block mb-1">{label}</span>
            <span className="text-xs opacity-80">{description}</span>
        </button>
    )
}
