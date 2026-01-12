'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTranslation, deleteTranslation } from '@/lib/translations'
import { translateText, translateBatch } from '@/lib/ai-translation'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface Language {
    code: string
    name: string
    isActive: boolean
}

interface Translation {
    key: string
    values: any // Record<string, string>
}

interface TranslationManagerProps {
    initialTranslations: Translation[]
    languages: Language[]
}

export function TranslationManager({ initialTranslations, languages }: TranslationManagerProps) {
    const router = useRouter()
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [newKey, setNewKey] = useState('')
    const [filter, setFilter] = useState('')
    const [translating, setTranslating] = useState<string | null>(null) // langCode being translated

    const handleEdit = (t: Translation) => {
        setEditingKey(t.key)
        setEditValues(t.values as Record<string, string> || {})
    }

    const handleSave = async (key: string) => {
        await updateTranslation(key, editValues)
        setEditingKey(null)
        setEditValues({})
        router.refresh()
    }

    const handleCancel = () => {
        setEditingKey(null)
        setEditValues({})
    }

    const handleAddKey = async () => {
        if (!newKey.trim()) return
        await updateTranslation(newKey, { de: newKey }) // Default DE value to key
        setNewKey('')
        router.refresh()
    }

    const handleDelete = async (key: string) => {
        if (!confirm('Are you sure you want to delete this key?')) return;
        await deleteTranslation(key)
        router.refresh()
    }

    const handleAiTranslate = async (targetLang: string, targetLangName: string) => {
        const sourceText = editValues['de'] || ''
        if (!sourceText) {
            alert('Please enter German source text first.')
            return
        }

        setTranslating(targetLang)
        try {
            const { translatedText, error } = await translateText(sourceText, targetLangName)
            if (error) {
                alert(error)
                return
            }
            if (translatedText) {
                setEditValues(prev => ({ ...prev, [targetLang]: translatedText }))
            }
        } catch (e) {
            console.error(e)
            alert('Translation failed')
        } finally {
            setTranslating(null)
        }
    }

    const handleBatchTranslate = async (targetLang: string, targetLangName: string) => {
        // 1. Identify missing keys
        const missingItems = initialTranslations
            .filter(t => {
                const vals = t.values as Record<string, string>
                const hasSource = !!vals['de']
                const isMissingTarget = !vals[targetLang] || !vals[targetLang].trim()
                return hasSource && isMissingTarget
            })
            .map(t => ({
                key: t.key,
                sourceText: (t.values as Record<string, string>)['de']
            }))

        if (missingItems.length === 0) {
            alert(`No missing translations found for ${targetLangName}.`)
            return
        }

        if (!confirm(`Found ${missingItems.length} missing translations for ${targetLangName}. Auto-translate them with AI?`)) {
            return
        }

        setTranslating(targetLang)
        try {
            // 2. Call Batch API
            const results = await translateBatch(missingItems, targetLangName, 'German')

            // 3. Update DB and UI
            let updateCount = 0
            for (const [key, translatedText] of Object.entries(results)) {
                if (translatedText) {
                    // Update DB with the new value, merging with existing values derived from current state
                    const currentT = initialTranslations.find(t => t.key === key)
                    const currentValues = currentT ? (currentT.values as Record<string, string>) : {}
                    await updateTranslation(key, { ...currentValues, [targetLang]: translatedText })
                    updateCount++
                }
            }

            alert(`Successfully translated ${updateCount} items!`)
            router.refresh()
        } catch (e) {
            console.error(e)
            alert('Batch translation failed')
        } finally {
            setTranslating(null)
        }
    }

    const [filterMissingLang, setFilterMissingLang] = useState<string>('')

    // ... (logic)

    const filteredTranslations = initialTranslations.filter(t => {
        const matchesText = t.key.toLowerCase().includes(filter.toLowerCase()) ||
            JSON.stringify(t.values).toLowerCase().includes(filter.toLowerCase())

        if (!matchesText) return false

        if (filterMissingLang) {
            const vals = t.values as Record<string, string>
            return !vals[filterMissingLang] || !vals[filterMissingLang].trim()
        }

        return true
    })

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search keys..."
                        className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />

                    <select
                        value={filterMissingLang}
                        onChange={(e) => setFilterMissingLang(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Show keys missing translation in..."
                    >
                        <option value="">Show All</option>
                        {languages.map(lang => (
                            lang.code !== 'de' && (
                                <option key={lang.code} value={lang.code}>Missing {lang.name}</option>
                            )
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="New Key Name"
                        className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 flex-grow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                    />
                    <button
                        onClick={handleAddKey}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
                    >
                        Add Key
                    </button>
                </div>
            </div>

            {/* Translations Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg shadow bg-white dark:bg-gray-900">
                <table className="min-w-max w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800/50 z-10 shadow-sm">Key</th>
                            {languages.map(lang => (
                                <th key={lang.code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                                    {lang.name} ({lang.code})
                                    {lang.code !== 'de' && (
                                        <button
                                            onClick={() => handleBatchTranslate(lang.code, lang.name)}
                                            disabled={!!translating}
                                            className="ml-2 inline-flex items-center p-1 text-indigo-100 hover:text-white bg-indigo-500 rounded-full disabled:opacity-50 disabled:bg-gray-400"
                                            title="Auto-fill missing with AI"
                                        >
                                            {translating === lang.code ? (
                                                <span className="animate-spin text-xs">⏳</span>
                                            ) : (
                                                <SparklesIcon className="w-3 h-3" />
                                            )}
                                        </button>
                                    )}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right sticky right-0 bg-gray-50 dark:bg-gray-800/50 z-10 shadow-sm text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredTranslations.map(t => (
                            <tr key={t.key} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-900 shadow-sm z-10 border-r border-gray-200 dark:border-gray-800">
                                    {t.key}
                                </td>
                                {languages.map(lang => (
                                    <td key={lang.code} className="px-6 py-4 text-sm text-gray-500">
                                        {editingKey === t.key ? (
                                            <div className="relative">
                                                <textarea
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm h-full min-h-[60px] pr-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={editValues[lang.code] || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, [lang.code]: e.target.value })}
                                                    placeholder={`Value for ${lang.code}`}
                                                />
                                                {lang.code !== 'de' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAiTranslate(lang.code, lang.name)}
                                                        disabled={translating === lang.code}
                                                        className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600 disabled:opacity-50"
                                                        title="AI Translate from German"
                                                    >
                                                        {translating === lang.code ? (
                                                            <span className="animate-spin">⏳</span>
                                                        ) : (
                                                            <SparklesIcon className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="block max-w-sm whitespace-normal text-gray-700 dark:text-gray-300 transition-colors" title={(t.values as any)[lang.code]}>
                                                {(t.values as any)[lang.code] || <span className="text-gray-300 dark:text-gray-600 italic">-</span>}
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white dark:bg-gray-900 shadow-sm z-10 border-l border-gray-200 dark:border-gray-800">
                                    {editingKey === t.key ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleSave(t.key)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Save</button>
                                            <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(t)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
                                            <button onClick={() => handleDelete(t.key)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
