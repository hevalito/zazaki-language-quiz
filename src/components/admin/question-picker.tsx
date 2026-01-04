
"use client"

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface QuestionPickerProps {
    onCancel: () => void
    onLink: (ids: string[]) => void
}

export function QuestionPicker({ onCancel, onLink }: QuestionPickerProps) {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetchPool = async () => {
            try {
                // Fetch only pooled questions
                const res = await fetch('/api/admin/questions?poolOnly=true')
                if (res.ok) {
                    const data = await res.json()
                    setQuestions(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPool()
    }, [])

    const toggle = (id: string) => {
        const newSet = new Set(selected)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelected(newSet)
    }

    const filtered = questions.filter(q => {
        if (!search) return true
        const term = search.toLowerCase()
        const prompt = typeof q.prompt === 'string'
            ? q.prompt
            : Object.values(q.prompt || {}).join(' ').toLowerCase()
        return prompt.includes(term)
    })

    const getPrompt = (prompt: any) => {
        if (!prompt) return 'No prompt'
        if (typeof prompt === 'string') return prompt
        return prompt.en || prompt.de || Object.values(prompt)[0]
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-lg font-medium text-gray-900">Link Questions from Bank</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 border-b bg-white">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="Search questions..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="text-center py-4">Loading pool...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No matching questions in the pool.</div>
                    ) : (
                        filtered.map(q => (
                            <div
                                key={q.id}
                                className={`flex items-start p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${selected.has(q.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                onClick={() => toggle(q.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.has(q.id)}
                                    onChange={() => { }} // handled by div click
                                    className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{getPrompt(q.prompt)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Type: {q.type} • ID: {q.id}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
                    <span className="text-sm text-gray-500">{selected.size} selected</span>
                    <div className="space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onLink(Array.from(selected))}
                            disabled={selected.size === 0}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            Add Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
