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
        'A1': 'bg-green-100 text-green-800',
        'A2': 'bg-green-100 text-green-800',
        'B1': 'bg-blue-100 text-blue-800',
        'B2': 'bg-blue-100 text-blue-800',
        'C1': 'bg-purple-100 text-purple-800',
        'C2': 'bg-purple-100 text-purple-800',
    }

    const level = quiz.lesson.chapter.course.level
    const isCompleted = quiz.status === 'completed'
    const questionCount = quiz._count.questions
    const tags = quiz.lesson.targetSkills || []

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${levelColors[level] || 'bg-gray-100'}`}>
                    {level}
                </span>
                {isCompleted && (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircleIconSolid className="w-5 h-5 mr-1" />
                        <span>{quiz.lastScore} Pkt</span>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {getTitle(quiz.title)}
            </h3>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {getTitle(quiz.lesson.chapter.course.title)}
            </p>

            {/* Metadata tags */}
            <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{questionCount} Fragen</span>
                </div>
                {tags.map((tag: string) => (
                    <div key={tag} className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <TagIcon className="w-3 h-3 mr-1" />
                        <span className="capitalize">{tag}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onStart(quiz.id)}
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors ${isCompleted
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
