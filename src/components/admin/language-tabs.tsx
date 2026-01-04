"use client"

import { useState } from 'react'

interface LanguageTabsProps {
    children: (lang: 'de' | 'en') => React.ReactNode
    className?: string
}

export function LanguageTabs({ children, className = '' }: LanguageTabsProps) {
    const [lang, setLang] = useState<'de' | 'en'>('de')

    return (
        <div className={className}>
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    type="button"
                    onClick={() => setLang('de')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${lang === 'de'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    DE *
                </button>
                <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${lang === 'en'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    EN
                </button>
            </div>

            <div className="min-h-[200px]">
                {children(lang)}
            </div>
        </div>
    )
}
