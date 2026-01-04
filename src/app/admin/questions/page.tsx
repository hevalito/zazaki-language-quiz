
'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, FunnelIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { QuestionList } from '@/components/admin/question-list'
import { QuestionForm } from '@/components/admin/question-form'
import { QuestionImporter } from '@/components/admin/question-importer'

export default function QuestionsAdmin() {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [filterPool, setFilterPool] = useState(true) // Default to "Pool Only"

    useEffect(() => {
        fetchQuestions()
    }, [filterPool])

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/questions?pool=${filterPool}`)
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
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowImport(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-gray-500" />
                        Import CSV
                    </button>
                    <button
                        onClick={handleCreate}
                        className="btn-primary flex items-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Question
                    </button>
                </div>
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
                    initialData={editingQuestion}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {showImport && (
                <QuestionImporter
                    onCancel={() => setShowImport(false)}
                    onSuccess={() => {
                        setShowImport(false)
                        fetchQuestions()
                    }}
                />
            )}
        </div>
    )
}
