'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AcademicCapIcon,
    ArrowPathIcon,
    SparklesIcon,
    XMarkIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/use-translation'

interface LearningOnboardingModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LearningOnboardingModal({ isOpen, onClose }: LearningOnboardingModalProps) {
    const { t } = useTranslation()
    const [step, setStep] = useState(0)

    const steps = [
        {
            icon: AcademicCapIcon,
            color: 'text-blue-500 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            title: t('onboarding.step1.title', 'Willkommen im Lernraum'),
            desc: t('onboarding.step1.desc', 'Hier festigst du dein Wissen. Wir verfolgen jede Vokabel und helfen dir, sie dauerhaft zu behalten.')
        },
        {
            icon: ArrowPathIcon,
            color: 'text-orange-500 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            title: t('onboarding.step2.title', 'Intelligente Wiederholung'),
            desc: t('onboarding.step2.desc', 'Wir wiederholen Wörter genau dann, wenn du sie vergessen würdest. Fehler sind hier gut – sie helfen uns, deinen Plan anzupassen.')
        },
        {
            icon: SparklesIcon,
            color: 'text-yellow-500 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            title: t('onboarding.step3.title', 'Dein Wissensschatz'),
            desc: t('onboarding.step3.desc', 'Beobachte, wie dein Wissen wächst. Ziel ist es, 100% zu erreichen. Jede Sitzung verbessert deinen Score.')
        }
    ]

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            onClose()
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all relative">
                                {/* Skip Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                <div className="mt-4 min-h-[300px] flex flex-col items-center justify-center text-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col items-center"
                                        >
                                            {/* Icon Circle */}
                                            <div className={`w-20 h-20 rounded-full ${steps[step].bg} flex items-center justify-center mb-6`}>
                                                {(() => {
                                                    const Icon = steps[step].icon
                                                    return <Icon className={`w-10 h-10 ${steps[step].color}`} />
                                                })()}
                                            </div>

                                            <Dialog.Title
                                                as="h3"
                                                className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100 mb-2"
                                            >
                                                {steps[step].title}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                                                    {steps[step].desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Controls */}
                                <div className="mt-8 flex items-center justify-between">
                                    {/* Dots */}
                                    <div className="flex space-x-2">
                                        {steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === step ? 'bg-primary-600 w-4' : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-primary rounded-full px-6 py-2 flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                        onClick={handleNext}
                                    >
                                        {step === steps.length - 1 ? (
                                            t('onboarding.start', "Los geht's")
                                        ) : (
                                            t('onboarding.next', "Weiter")
                                        )}
                                        {step < steps.length - 1 && (
                                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
