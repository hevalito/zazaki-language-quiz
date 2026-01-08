"use client"

import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { LanguageTabs } from './language-tabs'
import { getLanguages } from '@/lib/translations'
import { translateBatch } from '@/lib/ai-translation'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface QuestionFormProps {
    quizId?: string | null
    initialData?: any
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export function QuestionForm({ quizId, initialData, onSave, onCancel }: QuestionFormProps) {
    const [loading, setLoading] = useState(false)
    const [languages, setLanguages] = useState<any[]>([])
    const [formData, setFormData] = useState<any>({
        prompt: {},
        type: initialData?.type || 'MULTIPLE_CHOICE',
        points: initialData?.points || 10,
        choices: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const dbLanguages = await getLanguages()
            setLanguages(dbLanguages)

            // Initialize data with languages
            const initialPrompt = initialData?.prompt || {}
            const preparedPrompt: any = {}
            dbLanguages.forEach(l => {
                preparedPrompt[l.code] = initialPrompt[l.code] || ''
            })

            const initialChoices = initialData?.choices?.map((c: any) => {
                const preparedLabel: any = {}
                dbLanguages.forEach((l: any) => {
                    const existingLabel = typeof c.label === 'object' ? c.label : { de: c.label } // Handle old string format if any
                    preparedLabel[l.code] = existingLabel[l.code] || ''
                })
                return { ...c, label: preparedLabel }
            }) || [
                    createEmptyChoice(dbLanguages, true),
                    createEmptyChoice(dbLanguages, false),
                    createEmptyChoice(dbLanguages, false)
                ]

            setFormData({
                prompt: preparedPrompt,
                type: initialData?.type || 'MULTIPLE_CHOICE',
                points: initialData?.points || 10,
                choices: initialChoices
            })
        } catch (e) {
            console.error(e)
        }
    }

    const createEmptyChoice = (langs: any[], isCorrect: boolean) => {
        const labels: any = {}
        langs.forEach((l: any) => labels[l.code] = '')
        return { label: labels, isCorrect }
    }

    // Handle choice changes
    const updateChoice = (index: number, field: string, value: any) => {
        const newChoices = [...formData.choices]
        newChoices[index] = { ...newChoices[index], [field]: value }
        setFormData((prev: any) => ({ ...prev, choices: newChoices }))
    }

    const addChoice = () => {
        setFormData((prev: any) => ({
            ...prev,
            choices: [...prev.choices, createEmptyChoice(languages, false)]
        }))
    }

    const removeChoice = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            choices: prev.choices.filter((_: any, i: number) => i !== index)
        }))
    }

    // Auto-setup T/F choices
    useEffect(() => {
        if (formData.type === 'TRUE_FALSE' && languages.length > 0) {
            // Check if we already have valid T/F structure
            const isStandardTF = formData.choices.length === 2 && formData.choices[0].label['de'] === 'Wahr'

            if (!initialData && !isStandardTF) {
                const labelsTrue: any = {}
                const labelsFalse: any = {}
                languages.forEach(l => {
                    labelsTrue[l.code] = l.code === 'de' ? 'Wahr' : (l.code === 'en' ? 'True' : 'True')
                    labelsFalse[l.code] = l.code === 'de' ? 'Falsch' : (l.code === 'en' ? 'False' : 'False')
                })

                setFormData((prev: any) => ({
                    ...prev,
                    choices: [
                        { label: labelsTrue, isCorrect: true },
                        { label: labelsFalse, isCorrect: false }
                    ]
                }))
            }
        }
    }, [formData.type, languages])

    const [translating, setTranslating] = useState(false)

    const handleAutoTranslate = async (targetLang: string) => {
        // Collect source texts (German)
        const itemsToTranslate = []

        // 1. Prompt
        const promptDe = formData.prompt['de']
        if (promptDe && promptDe.trim()) {
            itemsToTranslate.push({ key: 'prompt', sourceText: promptDe })
        }

        // 2. Choices
        formData.choices.forEach((choice: any, index: number) => {
            const labelDe = choice.label['de']
            if (labelDe && labelDe.trim()) {
                itemsToTranslate.push({ key: `choice_${index}`, sourceText: labelDe })
            }
        })

        if (itemsToTranslate.length === 0) {
            alert('Please enter German content first.')
            return
        }

        if (!confirm(`Translate ${itemsToTranslate.length} fields from German to ${targetLang}? This will overwrite existing ${targetLang} content.`)) {
            return
        }

        setTranslating(true)
        try {
            const targetLangName = languages.find(l => l.code === targetLang)?.name || targetLang
            const results = await translateBatch(itemsToTranslate, targetLangName, 'German')

            // Apply results back to state
            const newFormData = { ...formData }

            if (results['prompt']) {
                newFormData.prompt = { ...newFormData.prompt, [targetLang]: results['prompt'] }
            }

            const newChoices = [...newFormData.choices]
            newChoices.forEach((choice: any, index: number) => {
                if (results[`choice_${index}`]) {
                    choice.label = { ...choice.label, [targetLang]: results[`choice_${index}`] }
                }
            })
            newFormData.choices = newChoices

            setFormData(newFormData)
            // alert('Translation complete!')
        } catch (error) {
            console.error(error)
            alert('Translation failed')
        } finally {
            setTranslating(false)
        }
    }

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

                    {/* Common Fields */}
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

                    {/* Tabbed Content (Prompt & Choices) */}
                    {languages.length > 0 && (
                        <LanguageTabs languages={languages}>
                            {(lang) => (
                                <div className="space-y-6">
                                    {lang !== 'de' && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleAutoTranslate(lang)}
                                                disabled={translating}
                                                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                            >
                                                {translating ? (
                                                    <span className="mr-1 animate-spin">⏳</span>
                                                ) : (
                                                    <SparklesIcon className="h-4 w-4 mr-1" />
                                                )}
                                                Auto-Translate this tab from German
                                            </button>
                                        </div>
                                    )}
                                    {/* Prompt */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Question Prompt ({languages.find(l => l.code === lang)?.name || lang})
                                        </label>
                                        <textarea
                                            required={lang === 'de'}
                                            rows={2}
                                            value={formData.prompt[lang] || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                prompt: { ...formData.prompt, [lang]: e.target.value }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                            placeholder={lang === 'de' ? 'Frage eingeben...' : `Enter question (${lang})...`}
                                        />
                                    </div>

                                    {/* Choices */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choices ({languages.find(l => l.code === lang)?.name || lang})
                                        </label>
                                        <div className="space-y-3">
                                            {formData.choices?.map((choice: any, index: number) => (
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
                                                            setFormData((prev: any) => ({ ...prev, choices: newChoices }))
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        required={lang === 'de'}
                                                        value={choice.label?.[lang] || ''}
                                                        onChange={e => updateChoice(index, 'label', {
                                                            ...choice.label,
                                                            [lang]: e.target.value
                                                        })}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                        placeholder={lang === 'de' ? `Option ${index + 1}` : `Option ${index + 1} (${lang})`}
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
                                </div>
                            )}
                        </LanguageTabs>
                    )}

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
