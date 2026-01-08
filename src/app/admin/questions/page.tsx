
'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, FunnelIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'
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
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [filterDifficulty, setFilterDifficulty] = useState('all')
    const [filterType, setFilterType] = useState('all')

    useEffect(() => {
        fetchQuestions()
    }, [filterPool, sortBy, sortOrder, filterDifficulty, filterType])

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                pool: String(filterPool),
                sortBy,
                order: sortOrder,
                difficulty: filterDifficulty,
                type: filterType
            })
            const res = await fetch(`/api/admin/questions?${params.toString()}`)
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
        <AdminPage>
            <AdminPageHeader
                title="Question Bank"
                description="Manage all questions, including the Daily Quiz Pool."
                actions={
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
                }
            />

            <AdminPageContent>

                {/* Filters & Sort Toolbar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Filters:</span>
                        </div>

                        {/* Filter: Pool Status */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setFilterPool(true)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterPool
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Pool Only
                            </button>
                            <button
                                onClick={() => setFilterPool(false)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!filterPool
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                All
                            </button>
                        </div>

                        {/* Filter: Difficulty */}
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="block w-32 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Difficulty (All)</option>
                            {[1, 2, 3, 4, 5].map(d => (
                                <option key={d} value={d}>Level {d}</option>
                            ))}
                        </select>

                        {/* Filter: Type */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="block w-40 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Type (All)</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="Audio">Audio</option>
                            <option value="Video">Video</option>
                            {/* Add other types as needed from the enum */}
                        </select>
                    </div>

                    <div className="flex items-center space-x-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="block w-32 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="createdAt">Date Added</option>
                            <option value="points">Points</option>
                            <option value="difficulty">Difficulty</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            title={sortOrder === 'asc' ? "Ascending" : "Descending"}
                        >
                            {sortOrder === 'asc' ? (
                                <ArrowUpTrayIcon className="w-5 h-5 transform rotate-180" />
                            ) : (
                                <ArrowUpTrayIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
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
            </AdminPageContent>
        </AdminPage>
    )
}
