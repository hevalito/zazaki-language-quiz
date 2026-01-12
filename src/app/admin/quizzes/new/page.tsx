
import { QuizForm } from '@/components/admin/quiz-form'

export default function NewQuizPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Quiz</h1>
            <QuizForm />
        </div>
    )
}
