"use client"

import CourseFinderWizard from '@/components/course-finder/wizard'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'

// Note: Metadata is not supported in client components.
// We should move metadata to a separate layout or use a server wrapper if needed.
// For now, I will remove the export since this is a page.tsx that needs to use hooks.
// Or effectively, I can wrap the content in a client component and keep this as server component.
// But to keep it simple and consistent with other pages that switched to use client for translation hooks:

export default function CourseFinderPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden flex flex-col items-center justify-center p-4 transition-colors">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-50 dark:bg-primary-900/10 rounded-bl-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gray-50 dark:bg-gray-900/50 rounded-tr-[80px] -z-10" />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <Image
                            src="/images/logo-icon.png"
                            alt="Zazakî Academy"
                            fill
                            className="object-contain" // Or use logo-icon if full is too wide
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
                        {t('courseFinder.title', 'Finde deinen')}{' '}
                        <span className="text-primary-600 dark:text-primary-500 relative inline-block">
                            {t('courseFinder.way', 'Weg')}
                            <svg className="absolute w-full h-2 -bottom-1 left-0 text-primary-200 dark:text-primary-800 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-sans leading-relaxed">
                        {t('courseFinder.subtitle', 'Beantworte uns ein paar Fragen zu deiner Herkunft und Erfahrung. Wir zeigen dir den idealen Einstieg in die Zazakî-Sprache.')}
                    </p>
                </div>

                <CourseFinderWizard />

                <div className="text-center mt-8">
                    <a href="/" className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-widest">
                        {t('common.backToHome', 'Zurück zur Startseite')}
                    </a>
                </div>
            </div>
        </div>
    )
}
