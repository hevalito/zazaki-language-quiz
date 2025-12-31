"use client"

import { useState } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

interface QuestionListProps {
    quizId: string
    questions: any[]
    onEdit: (question: any) => void
    onDelete: (id: string) => void
    onAdd: () => void
}

const getPrompt = (prompt: any) => {
    if (typeof prompt === 'string') return prompt
    return prompt?.de || prompt?.en || prompt?.ku || 'Untitled Question'
}

export function QuestionList({ quizId, questions, onEdit, onDelete, onAdd }: QuestionListProps) {

    return (
        <div className="mt-10">
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

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {questions.map((question, index) => (
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
