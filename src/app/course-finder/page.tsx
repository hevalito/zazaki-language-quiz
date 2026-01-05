import CourseFinderWizard from '@/components/course-finder/wizard'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Kursfinder | Zazakî Academy',
    description: 'Finde den passenden Zazakî-Sprachkurs für deinen Dialekt und deine Vorkenntnisse.',
}

export default function CourseFinderPage() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-50 rounded-bl-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gray-50 rounded-tr-[80px] -z-10" />
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
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-4">
                        Finde deinen <span className="text-primary-600 relative inline-block">
                            Weg
                            <svg className="absolute w-full h-2 -bottom-1 left-0 text-primary-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto font-sans leading-relaxed">
                        Beantworte uns ein paar Fragen zu deiner Herkunft und Erfahrung. Wir zeigen dir den idealen Einstieg in die Zazakî-Sprache.
                    </p>
                </div>

                <CourseFinderWizard />

                <div className="text-center mt-8">
                    <a href="/" className="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-widest">
                        Zurück zur Startseite
                    </a>
                </div>
            </div>
        </div>
    )
}
