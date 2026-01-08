'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTranslation, deleteTranslation } from '@/lib/translations'

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

    const filteredTranslations = initialTranslations.filter(t =>
        t.key.toLowerCase().includes(filter.toLowerCase()) ||
        JSON.stringify(t.values).toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search keys..."
                        className="border rounded px-3 py-2"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="New Key Name"
                            className="border rounded px-3 py-2"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                        />
                        <button
                            onClick={handleAddKey}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add Key
                        </button>
                    </div>
                </div>
            </div>

            {/* Translations Table */}
            <div className="overflow-x-auto border rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                            {languages.map(lang => (
                                <th key={lang.code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {lang.name} ({lang.code})
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTranslations.map(t => (
                            <tr key={t.key} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                    {t.key}
                                </td>
                                {languages.map(lang => (
                                    <td key={lang.code} className="px-6 py-4 text-sm text-gray-500">
                                        {editingKey === t.key ? (
                                            <textarea
                                                className="w-full border rounded p-1 text-sm h-full min-h-[40px]"
                                                value={editValues[lang.code] || ''}
                                                onChange={(e) => setEditValues({ ...editValues, [lang.code]: e.target.value })}
                                                placeholder={`Value for ${lang.code}`}
                                            />
                                        ) : (
                                            <span className="block max-w-xs truncate" title={(t.values as any)[lang.code]}>
                                                {(t.values as any)[lang.code] || <span className="text-gray-300 italic">-</span>}
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingKey === t.key ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleSave(t.key)} className="text-green-600 hover:text-green-900">Save</button>
                                            <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(t)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            <button onClick={() => handleDelete(t.key)} className="text-red-600 hover:text-red-900">Delete</button>
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
