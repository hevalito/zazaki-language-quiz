'use client'

import { useState } from 'react'
import { addLanguage, deleteLanguage, toggleLanguageStatus } from '@/lib/translations'
import { TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface Language {
    code: string
    name: string
    isActive: boolean
}

interface LanguageSettingsProps {
    languages: Language[]
}

export function LanguageSettings({ languages }: LanguageSettingsProps) {
    const router = useRouter()
    const [newLangCode, setNewLangCode] = useState('')
    const [newLangName, setNewLangName] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleAddLanguage = async () => {
        if (!newLangCode || !newLangName) return
        setLoading(true)
        try {
            await addLanguage(newLangCode, newLangName)
            setNewLangCode('')
            setNewLangName('')
            setIsAdding(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to add language', error)
            alert('Failed to add language')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (code: string) => {
        if (code === 'de') {
            alert('Cannot delete default language (de)')
            return
        }
        if (!confirm(`Are you sure you want to delete ${code}? This may affect content.`)) return

        try {
            await deleteLanguage(code)
            router.refresh()
        } catch (error) {
            console.error('Failed to delete language', error)
        }
    }

    const handleToggle = async (code: string, currentStatus: boolean) => {
        if (code === 'de') {
            alert('Cannot disable default language (de)')
            return
        }
        try {
            await toggleLanguageStatus(code, !currentStatus)
            router.refresh()
        } catch (error) {
            console.error('Failed to toggle language', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Supported Languages</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary text-sm px-3 py-1.5"
                >
                    {isAdding ? 'Cancel' : 'Add Language'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-end gap-3 animate-fade-in">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Code (ISO 2)</label>
                        <input
                            type="text"
                            placeholder="e.g. tr"
                            value={newLangCode}
                            onChange={e => setNewLangCode(e.target.value.toLowerCase())}
                            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            maxLength={2}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Turkish"
                            value={newLangName}
                            onChange={e => setNewLangName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                    </div>
                    <button
                        onClick={handleAddLanguage}
                        disabled={loading || !newLangCode || !newLangName}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium h-[38px]"
                    >
                        {loading ? 'Adding...' : 'Save'}
                    </button>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {languages.map((lang) => (
                        <li key={lang.code} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 font-bold text-gray-600 text-xs uppercase mr-3 border border-gray-300">
                                    {lang.code}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-blue-600 truncate">{lang.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {lang.code === 'de' ? 'Default Language' : lang.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Toggle Active Status */}
                                {lang.code !== 'de' && (
                                    <button
                                        onClick={() => handleToggle(lang.code, lang.isActive)}
                                        className={`p-1 rounded-full ${lang.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={lang.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {lang.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                                    </button>
                                )}

                                {/* Delete */}
                                {lang.code !== 'de' && (
                                    <button
                                        onClick={() => handleDelete(lang.code)}
                                        className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                        title="Delete Language"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
