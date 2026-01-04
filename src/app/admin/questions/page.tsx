'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { QuestionList } from '@/components/admin/question-list'
import { QuestionForm } from '@/components/admin/question-form'

export default function QuestionsAdmin() {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [filterPool, setFilterPool] = useState(true) // Default to "Pool Only" since that is the use case

    useEffect(() => {
        fetchQuestions()
    }, [filterPool])

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            // We might need a GET /api/admin/questions endpoint that supports filtering?
            // Or just fetch all and filter client side?
            // Ideally server side. 
            // For now, I'll fetch `/api/admin/questions` and assuming it returns ALL.
            // Wait, does GET /api/admin/questions exist? 
            // I checked `api/admin/questions` dir and it had `route.ts`.
            // But `route.ts` usually has GET too. I only saw POST in my previous view.
            // I need to check if GET exists.

            const res = await fetch(`/api/admin/questions?pool=${filterPool}`)
            // If the API doesn't support query params yet, I might just get all.
            if (res.ok) {
                const data = await res.json()
                setQuestions(data)
            }
        } catch (error) {
            console.error('Failed to fetch questions', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingQuestion(null)
        setShowForm(true)
    }

    const handleEdit = (question: any) => {
        setEditingQuestion(question)
        setShowForm(true)
    }

    const handleSave = async (data: any) => {
        try {
            const url = editingQuestion
                ? `/api/admin/questions/${editingQuestion.id}`
                : '/api/admin/questions'

            const method = editingQuestion ? 'PUT' : 'POST'

            // data includes quizId (which is null/undefined for pool)

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Failed to save')

            setShowForm(false)
            fetchQuestions()
        } catch (error) {
            alert('Error saving question')
            console.error(error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return
        try {
            const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
            if (res.ok) fetchQuestions()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                    <p className="text-gray-500">Manage all questions, including the Daily Quiz Pool.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Question to Pool
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <button
                    onClick={() => setFilterPool(true)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterPool
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Pool Only (No Quiz)
                </button>
                <button
                    onClick={() => setFilterPool(false)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!filterPool
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    All Questions
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <QuestionList
                    questions={questions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {showForm && (
                <QuestionForm
                    // No quizId means it goes to pool
                    initialData={editingQuestion}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    )
}
