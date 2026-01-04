import {
    CheckCircleIcon,
    PlayIcon,
    ClockIcon,
    TagIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface QuizCardProps {
    quiz: any
    onStart: (id: string) => void
}

export function QuizCard({ quiz, onStart }: QuizCardProps) {
    const getTitle = (title: any) => {
        return title?.de || title?.en || 'Unbenanntes Quiz'
    }

    const levelColors: Record<string, string> = {
        'A0': 'bg-gray-100 text-gray-800',
        'A1': 'bg-brand-green/10 text-brand-green border border-brand-green/20',
        'A2': 'bg-brand-green/10 text-brand-green border border-brand-green/20',
        'B1': 'bg-primary-100 text-primary-800 border border-primary-200',
        'B2': 'bg-primary-100 text-primary-800 border border-primary-200',
        'C1': 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20', // Assuming brand-purple exists or defaulting
        'C2': 'bg-brand-red/10 text-brand-red border border-brand-red/20',
    }

    const level = quiz.lesson.chapter.course.level
    const isCompleted = quiz.status === 'completed'
    const questionCount = quiz._count.questions
    const tags = quiz.lesson.targetSkills || []

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-primary-200 p-5 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${levelColors[level] || 'bg-gray-100'}`}>
                    {level}
                </span>
                {isCompleted && (
                    <div className="flex items-center text-brand-green text-sm font-bold">
                        <CheckCircleIconSolid className="w-5 h-5 mr-1" />
                        <span>{quiz.lastScore} Pkt</span>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {getTitle(quiz.title)}
            </h3>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {getTitle(quiz.lesson.chapter.course.title)}
            </p>

            {/* Metadata tags */}
            <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{questionCount} Fragen</span>
                </div>
                {tags.map((tag: string) => (
                    <div key={tag} className="flex items-center text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded border border-primary-100">
                        <TagIcon className="w-3 h-3 mr-1" />
                        <span className="capitalize">{tag}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onStart(quiz.id)}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${isCompleted
                    ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    : 'bg-primary-500 text-gray-900 hover:bg-primary-400 shadow-sm active:scale-[0.98]'
                    }`}
            >
                {isCompleted ? (
                    <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Wiederholen
                    </>
                ) : (
                    <>
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Starten
                    </>
                )}
            </button>
        </div>
    )
}
