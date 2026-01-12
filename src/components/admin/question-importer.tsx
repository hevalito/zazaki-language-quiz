
"use client"

import { useState } from 'react'
import Papa from 'papaparse'
import { ArrowUpTrayIcon, DocumentArrowDownIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface QuestionImporterProps {
    onCancel: () => void
    onSuccess: () => void
}

export function QuestionImporter({ onCancel, onSuccess }: QuestionImporterProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [errors, setErrors] = useState<string[]>([])
    const [importing, setImporting] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            parseFile(selected)
        }
    }

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = processRows(results.data)
                setPreview(parsed.questions)
                setErrors(parsed.errors)
            },
            error: (err) => {
                setErrors([err.message])
            }
        })
    }

    const processRows = (rows: any[]): { questions: any[], errors: string[] } => {
        const questions: any[] = []
        const globalErrors: string[] = []

        rows.forEach((row, index) => {
            const line = index + 2 // Header is 1
            const prompt: Record<string, string> = {}
            const explanation: Record<string, string> = {}
            const correct: Record<string, string> = {}
            const wrong1: Record<string, string> = {}
            const wrong2: Record<string, string> = {}
            const wrong3: Record<string, string> = {}

            // Extract multilingual fields
            Object.keys(row).forEach(key => {
                const val = row[key]?.trim()
                if (!val) return

                const k = key.toLowerCase()

                if (k.startsWith('question_')) prompt[k.replace('question_', '')] = val
                else if (k.startsWith('explanation_')) explanation[k.replace('explanation_', '')] = val
                else if (k.startsWith('correct_')) correct[k.replace('correct_', '')] = val
                else if (k.startsWith('wrong1_')) wrong1[k.replace('wrong1_', '')] = val
                else if (k.startsWith('wrong2_')) wrong2[k.replace('wrong2_', '')] = val
                else if (k.startsWith('wrong3_')) wrong3[k.replace('wrong3_', '')] = val
            })

            // Allow generic 'question' etc as fallback to 'en'
            if (row['question']) prompt['en'] = row['question']
            if (row['correct']) correct['en'] = row['correct']

            // Validation
            const hasPrompt = Object.keys(prompt).length > 0
            const hasCorrect = Object.keys(correct).length > 0
            const hasWrong = Object.keys(wrong1).length > 0 // At least 1 wrong required for MC?

            if (!hasPrompt) globalErrors.push(`Row ${line}: Missing question text`)
            if (!hasCorrect) globalErrors.push(`Row ${line}: Missing correct answer`)

            // Build Question Object
            const choices = []
            if (hasCorrect) choices.push({ label: correct, isCorrect: true })
            if (Object.keys(wrong1).length > 0) choices.push({ label: wrong1, isCorrect: false })
            if (Object.keys(wrong2).length > 0) choices.push({ label: wrong2, isCorrect: false })
            if (Object.keys(wrong3).length > 0) choices.push({ label: wrong3, isCorrect: false })

            if (hasPrompt && hasCorrect) {
                questions.push({
                    prompt,
                    explanation,
                    choices,
                    points: parseInt(row.points) || 10,
                    difficulty: parseInt(row.difficulty) || 3, // 1-5 scale (1: Easy, 3: Med, 5: Hard) - User asked for EASY/MEDIUM. Map?
                    // Map Easy/Medium/Hard words to scale if needed.
                    type: 'MULTIPLE_CHOICE' // Default
                })
            }
        })

        return { questions, errors: globalErrors }
    }

    const handleImport = async () => {
        if (preview.length === 0) return
        setImporting(true)

        try {
            const res = await fetch('/api/admin/questions/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: preview })
            })

            if (res.ok) {
                const data = await res.json()
                alert(`Successfully imported ${data.count} questions!`)
                onSuccess()
            } else {
                alert('Import failed')
            }
        } catch (e) {
            console.error(e)
            alert('Error during import')
        } finally {
            setImporting(false)
        }
    }

    const downloadTemplate = () => {
        const headers = [
            'question_en', 'question_de', 'question_ku',
            'correct_en', 'correct_de', 'correct_ku',
            'wrong1_en', 'wrong1_de', 'wrong1_ku',
            'wrong2_en', 'wrong2_de', 'wrong2_ku',
            'points', 'difficulty'
        ]
        const sample = [
            'What is "Apple"?', 'Was ist "Apfel"?', 'Sêv çi ye?',
            'Apple', 'Apfel', 'Sêv',
            'Banana', 'Banane', 'Mûz',
            'Orange', 'Orange', 'Portaqal',
            '10', '3'
        ]

        const csv = [headers.join(','), sample.join(',')].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'question_import_template.csv'
        a.click()
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-colors border border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Import Questions (CSV)</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <span className="sr-only">Close</span>
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white dark:bg-gray-900">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex justify-between items-start border border-blue-100 dark:border-blue-900/50">
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Instructions</h3>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                                Upload a CSV file with headers for questions and answers.
                                Supports <code>_en</code>, <code>_de</code>, <code>_ku</code> suffixes for multilingual content.
                            </p>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300 font-mono text-xs">
                                Required: question_*, correct_*<br />
                                Optional: wrong1_*, wrong2_*, wrong3_*, points, difficulty
                            </p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-700 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/80"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Download Template
                        </button>
                    </div>

                    {!file ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none px-2 rounded">
                                    <span>Upload a file</span>
                                    <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">CSV up to 10MB</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{file.name}</span>
                                <button onClick={() => { setFile(null); setPreview([]); setErrors([]); }} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                    Change File
                                </button>
                            </div>

                            {errors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-100 dark:border-red-900/50">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Validation Errors</h4>
                                    <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                                        {errors.map((e, i) => <li key={i}>{e}</li>)}
                                    </ul>
                                </div>
                            )}

                            {preview.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Preview ({preview.length} valid questions)</h4>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Choices</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                                {preview.slice(0, 10).map((q, i) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                            <div>{q.prompt.en || Object.values(q.prompt)[0]}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{Object.keys(q.prompt).join(', ')}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                            {q.choices.length} choices
                                                            <div className="text-xs text-green-600 dark:text-green-400">Correct: {q.choices.find((c: any) => c.isCorrect)?.label?.en || 'Yes'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{q.points}</td>
                                                    </tr>
                                                ))}
                                                {preview.length > 10 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                            ...and {preview.length - 10} more
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={preview.length === 0 || importing}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {importing && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        Import Questions
                    </button>
                </div>
            </div>
        </div>
    )
}
