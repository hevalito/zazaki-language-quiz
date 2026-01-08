"use client"

import { useState } from 'react'

interface LanguageTabsProps {
    languages?: { code: string; name: string; isActive?: boolean }[]
    children: (lang: string) => React.ReactNode
    className?: string
}

export function LanguageTabs({ languages, children, className = '' }: LanguageTabsProps) {
    const [lang, setLang] = useState<string>('de')

    // Default to 'de' and 'en' if no languages provided (backward compat / fallback)
    const activeLanguages = languages?.filter(l => l.isActive !== false) || [
        { code: 'de', name: 'German' },
        { code: 'en', name: 'English' }
    ]

    return (
        <div className={className}>
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {activeLanguages.map((l) => (
                    <button
                        key={l.code}
                        type="button"
                        onClick={() => setLang(l.code)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${lang === l.code
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {l.name}
                        {l.code === 'de' && ' *'}
                    </button>
                ))}
            </div>

            <div className="min-h-[200px]">
                {children(lang)}
            </div>
        </div>
    )
}
