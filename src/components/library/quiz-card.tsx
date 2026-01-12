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
    const getLocalizedText = (obj: any) => {
        if (!obj) return ''
        return obj.de || obj.en || ''
    }

    const levelColors: Record<string, string> = {
        'A0': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
        'A1': 'bg-brand-green/10 dark:bg-green-900/30 text-brand-green dark:text-green-400 border border-brand-green/20 dark:border-green-800',
        'A2': 'bg-brand-green/10 dark:bg-green-900/30 text-brand-green dark:text-green-400 border border-brand-green/20 dark:border-green-800',
        'B1': 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800',
        'B2': 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800',
        'C1': 'bg-brand-purple/10 dark:bg-purple-900/30 text-brand-purple dark:text-purple-400 border border-brand-purple/20 dark:border-purple-800',
        'C2': 'bg-brand-red/10 dark:bg-red-900/30 text-brand-red dark:text-red-400 border border-brand-red/20 dark:border-red-800',
        'Daily': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    }

    const level = quiz.lesson?.chapter?.course?.level || (quiz.type === 'DAILY' ? 'Daily' : 'N/A')
    const isCompleted = quiz.status === 'completed'
    const questionCount = quiz._count?.questions || 0
    const tags = quiz.lesson?.targetSkills || []

    // Get localized strings
    const title = getLocalizedText(quiz.title) || 'Unbenanntes Quiz'
    const courseTitle = getLocalizedText(quiz.lesson?.chapter?.course?.title) || (quiz.type === 'DAILY' ? 'Tägliche Herausforderung' : '')
    const description = getLocalizedText(quiz.description)

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all hover:border-primary-200 dark:hover:border-primary-900/50 p-5 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${levelColors[level] || 'bg-gray-100 dark:bg-gray-800'}`}>
                    {level}
                </span>
                {isCompleted && (
                    <div className="flex items-center text-brand-green dark:text-green-400 text-sm font-bold">
                        <CheckCircleIconSolid className="w-5 h-5 mr-1" />
                        <span>{quiz.bestScore} XP</span>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
            </h3>

            {courseTitle && (
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2 truncate opacity-80">
                    {courseTitle}
                </p>
            )}

            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2" title={description}>
                    {description}
                </p>
            )}

            {/* Spacer if no description/tags locally to keep cards somewhat aligned? 
            Flex-grow handling will push button down anyway. */}

            {/* Metadata tags */}
            <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{questionCount} Fragen</span>
                </div>
                {tags.map((tag: string) => (
                    <div key={tag} className="flex items-center text-xs text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded border border-primary-100 dark:border-primary-900/30">
                        <TagIcon className="w-3 h-3 mr-1" />
                        <span className="capitalize">{tag}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onStart(quiz.id)}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${isCompleted
                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
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
