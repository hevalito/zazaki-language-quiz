"use client"

import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface QuestionFormProps {
    quizId: string
    initialData?: any
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export function QuestionForm({ quizId, initialData, onSave, onCancel }: QuestionFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        prompt: {
            en: initialData?.prompt?.en || '',
            de: initialData?.prompt?.de || ''
        },
        type: initialData?.type || 'MULTIPLE_CHOICE',
        points: initialData?.points || 10,
        choices: initialData?.choices?.map((c: any) => ({
            ...c,
            label: typeof c.label === 'object' ? (c.label.de || c.label.en || Object.values(c.label)[0] || '') : c.label || ''
        })) || [
                { label: '', isCorrect: true },
                { label: '', isCorrect: false },
                { label: '', isCorrect: false }
            ]
    })

    // Handle choice changes
    const updateChoice = (index: number, field: string, value: any) => {
        const newChoices = [...formData.choices]
        newChoices[index] = { ...newChoices[index], [field]: value }
        setFormData({ ...formData, choices: newChoices })
    }

    const addChoice = () => {
        setFormData({
            ...formData,
            choices: [...formData.choices, { label: '', isCorrect: false }]
        })
    }

    const removeChoice = (index: number) => {
        setFormData({
            ...formData,
            choices: formData.choices.filter((_: any, i: number) => i !== index)
        })
    }

    useEffect(() => {
        if (initialData) {
            setFormData({
                prompt: {
                    en: initialData?.prompt?.en || '',
                    de: initialData?.prompt?.de || ''
                },
                type: initialData?.type || 'MULTIPLE_CHOICE',
                points: initialData?.points || 10,
                choices: initialData?.choices?.map((c: any) => ({
                    ...c,
                    label: typeof c.label === 'object' ? (c.label.de || c.label.en || Object.values(c.label)[0] || '') : c.label || ''
                })) || [
                        { label: '', isCorrect: true },
                        { label: '', isCorrect: false },
                        { label: '', isCorrect: false }
                    ]
            })
        }
    }, [initialData])

    // Auto-setup T/F choices
    useEffect(() => {
        if (formData.type === 'TRUE_FALSE') {
            // Check if we already have valid T/F structure
            const isStandardTF = formData.choices.length === 2
                && (formData.choices[0].label === 'Wahr' || formData.choices[0].label === 'True')

            if (!initialData && !isStandardTF) {
                setFormData(prev => ({
                    ...prev,
                    choices: [
                        { label: 'Wahr', isCorrect: true },
                        { label: 'Falsch', isCorrect: false }
                    ]
                }))
            }
        }
    }, [formData.type])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave({
                ...formData,
                quizId,
                points: Number(formData.points)
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                            {initialData ? 'Edit Question' : 'New Question'}
                        </h3>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Prompt DE (Default) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Prompt (DE - Default)</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.prompt.de}
                            onChange={e => setFormData({
                                ...formData,
                                prompt: { ...formData.prompt, de: e.target.value }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="Frage auf Deutsch..."
                        />
                    </div>

                    {/* Prompt EN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Prompt (EN)</label>
                        <textarea
                            rows={2}
                            value={formData.prompt.en}
                            onChange={e => setFormData({
                                ...formData,
                                prompt: { ...formData.prompt, en: e.target.value }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="Question in English (optional)..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            >
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="TRUE_FALSE">True / False</option>
                            </select>
                        </div>

                        {/* Points */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Points</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.points}
                                onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            />
                        </div>
                    </div>

                    {/* Choices */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                        <div className="space-y-3">
                            {formData.choices.map((choice: any, index: number) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="correct-choice"
                                        checked={choice.isCorrect}
                                        onChange={() => {
                                            const newChoices = formData.choices.map((c: any, i: number) => ({
                                                ...c,
                                                isCorrect: i === index
                                            }))
                                            setFormData({ ...formData, choices: newChoices })
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={choice.label}
                                        onChange={e => updateChoice(index, 'label', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                        placeholder={`Option ${index + 1}`}
                                        // Lock labels for T/F
                                        disabled={formData.type === 'TRUE_FALSE'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeChoice(index)}
                                        className="text-red-400 hover:text-red-500 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={formData.choices.length <= 2 || formData.type === 'TRUE_FALSE'}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {formData.type !== 'TRUE_FALSE' && (
                            <button
                                type="button"
                                onClick={addChoice}
                                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Option
                            </button>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
