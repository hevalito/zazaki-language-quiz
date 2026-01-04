"use client"

import { useState } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

interface QuestionListProps {
    quizId?: string
    questions: any[]
    onEdit: (question: any) => void
    onDelete: (id: string) => void
    onAdd?: () => void
    onReorder?: (id: string, direction: 'up' | 'down') => void
}

const getPrompt = (prompt: any) => {
    if (typeof prompt === 'string') return prompt
    // Default to German if available
    return prompt?.de || prompt?.en || prompt?.ku || 'Untitled Question'
}

export function QuestionList({ quizId, questions, onEdit, onDelete, onAdd, onReorder }: QuestionListProps) {
    const sortedQuestions = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0))

    return (
        <div className="mt-10">
            {onAdd && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Questions</h2>
                    <button
                        onClick={onAdd}
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Question
                    </button>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {sortedQuestions.map((question, index) => (
                        <li key={question.id}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                <div>
                                    <span className="text-sm text-gray-500 font-mono mr-2">#{index + 1}</span>
                                    <span className="text-sm font-medium text-gray-900">{getPrompt(question.prompt)}</span>
                                    <div className="mt-1 flex gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {question.type}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {question.points} pts
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {onReorder && (
                                        <div className="flex flex-col mr-2">
                                            <button
                                                onClick={() => onReorder(question.id, 'up')}
                                                disabled={index === 0}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => onReorder(question.id, 'down')}
                                                disabled={index === sortedQuestions.length - 1}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => onEdit(question)}
                                        className="p-1 text-gray-400 hover:text-gray-500"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(question.id)}
                                        className="p-1 text-red-400 hover:text-red-500"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {questions.length === 0 && (
                        <li className="px-4 py-6 text-center text-gray-500 text-sm">
                            No questions yet. Add one to get started.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
