import CourseFinderWizard from '@/components/course-finder/wizard'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kursfinder | Zazakî Quiz',
    description: 'Finde den passenden Zazakî-Sprachkurs für deinen Dialekt und deine Vorkenntnisse.',
}

export default function CourseFinderPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                    Finde deinen Kurs 🎯
                </h1>
                <p className="text-lg text-gray-600 max-w-lg mx-auto">
                    Beantworte ein paar Fragen und wir zeigen dir, welcher Lernweg am besten zu dir passt.
                </p>
            </div>

            <CourseFinderWizard />
        </div>
    )
}
