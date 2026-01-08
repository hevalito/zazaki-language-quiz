"use client"

import { useState } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface QuestionListProps {
    quizId?: string
    questions: any[]
    onEdit: (question: any) => void
    onDelete: (id: string) => void
    onAdd?: () => void
    onReorder?: (id: string, direction: 'up' | 'down') => void
    onLinkExisting?: () => void
}

const getPrompt = (prompt: any) => {
    if (typeof prompt === 'string') return prompt
    // Default to German if available
    return prompt?.de || prompt?.en || prompt?.ku || 'Untitled Question'
}

export function QuestionList({ quizId, questions, onEdit, onDelete, onAdd, onReorder, onLinkExisting }: QuestionListProps) {
    const sortedQuestions = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0))

    return (
        <div className="mt-10">
            {onAdd && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Questions</h2>
                    <div className="flex space-x-2">
                        {onLinkExisting && (
                            <button
                                onClick={onLinkExisting}
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                                Link Existing
                            </button>
                        )}
                        <button
                            onClick={onAdd}
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Question
                        </button>
                    </div>
                </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Points</TableHead>
                            {onReorder && <TableHead>Order</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedQuestions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={onReorder ? 6 : 5} className="text-center py-6 text-gray-500">
                                    No questions yet. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedQuestions.map((question, index) => (
                                <TableRow key={question.id}>
                                    <TableCell className="font-mono text-gray-500">{index + 1}</TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {getPrompt(question.prompt)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {question.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {question.points} pts
                                        </span>
                                    </TableCell>
                                    {onReorder && (
                                        <TableCell>
                                            <div className="flex flex-col">
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
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
