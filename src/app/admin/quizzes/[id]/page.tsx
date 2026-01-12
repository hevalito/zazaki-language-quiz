
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { QuizForm } from '@/components/admin/quiz-form'
import { QuestionList } from '@/components/admin/question-list'
import { QuestionForm } from '@/components/admin/question-form'
import { QuestionPicker } from '@/components/admin/question-picker'

export default function EditQuizPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const router = useRouter()
    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    useEffect(() => {
        fetchQuiz()
    }, [])

    const fetchQuiz = async () => {
        try {
            const res = await fetch(`/api/admin/quizzes/${params.id}`)

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") === -1) {
                // Not a JSON response (likely HTML error page or redirect)
                console.error("Received non-JSON response:", await res.text());
                alert("Session expired or server error. Please log in again.");
                return;
            }

            if (res.ok) {
                const data = await res.json()
                setQuiz(data)
            } else {
                alert('Failed to load quiz')
            }
        } catch (error) {
            console.error(error)
            alert("Error loading quiz. Check console for details.")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveQuestion = async (questionData: any) => {
        try {
            const url = editingQuestion
                ? `/api/admin/questions/${editingQuestion.id}`
                : '/api/admin/questions'

            const method = editingQuestion ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionData)
            })

            if (res.ok) {
                await fetchQuiz()
                setIsQuestionModalOpen(false)
                setEditingQuestion(null)
            } else {
                alert('Failed to save question')
            }
        } catch (error) {
            console.error(error)
            alert('Error saving question')
        }
    }

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return

        try {
            const res = await fetch(`/api/admin/questions/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchQuiz()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleLinkQuestions = async (ids: string[]) => {
        try {
            const res = await fetch('/api/admin/questions/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids,
                    action: 'assign',
                    targetId: quiz.id
                })
            })

            if (res.ok) {
                fetchQuiz()
                setIsPickerOpen(false)
            } else {
                alert('Failed to link questions')
            }
        } catch (error) {
            console.error(error)
            alert('Error linking questions')
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!quiz) return <div className="p-8">Quiz not found</div>

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Quiz</h1>
            </div>

            <QuizForm initialData={quiz} isEditing />

            <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-10">
                <QuestionList
                    quizId={quiz.id}
                    questions={quiz.questions || []}
                    onLinkExisting={() => setIsPickerOpen(true)}
                    onEdit={(q) => {
                        setEditingQuestion(q)
                        setIsQuestionModalOpen(true)
                    }}
                    onDelete={handleDeleteQuestion}
                    onAdd={() => {
                        setEditingQuestion(null)
                        setIsQuestionModalOpen(true)
                    }}
                    onReorder={async (id, direction) => {
                        const sorted = [...(quiz.questions || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        const currentIndex = sorted.findIndex((q: any) => q.id === id)
                        if (currentIndex === -1) return

                        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
                        if (targetIndex < 0 || targetIndex >= sorted.length) return

                        // Swap in local array
                        const newQuestions = [...sorted]
                        const [movedItem] = newQuestions.splice(currentIndex, 1)
                        newQuestions.splice(targetIndex, 0, movedItem)

                        // Assign new orders
                        const updates = newQuestions.map((q, index) => ({
                            id: q.id,
                            order: index
                        }))

                        try {
                            const res = await fetch('/api/admin/questions/reorder', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ items: updates })
                            })

                            if (res.ok) {
                                fetchQuiz()
                            } else {
                                console.error('Failed to save order')
                            }
                        } catch (e) {
                            console.error('Reorder failed', e)
                        }
                    }}
                />
            </div>

            {isQuestionModalOpen && (
                <QuestionForm
                    quizId={quiz.id}
                    initialData={editingQuestion}
                    onSave={handleSaveQuestion}
                    onCancel={() => {
                        setIsQuestionModalOpen(false)
                        setEditingQuestion(null)
                    }}
                />
            )}

            {isPickerOpen && (
                <QuestionPicker
                    onCancel={() => setIsPickerOpen(false)}
                    onLink={handleLinkQuestions}
                />
            )}
        </div>
    )
}
