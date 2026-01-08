'use client'

import React, { createContext, useContext } from 'react'

type Dictionary = Record<string, string>

interface TranslationContextType {
    dictionary: Dictionary
    locale: string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

export function TranslationProvider({
    children,
    dictionary,
    locale = 'de',
}: {
    children: React.ReactNode
    dictionary: Dictionary
    locale?: string
}) {
    return (
        <TranslationContext.Provider value={{ dictionary, locale }}>
            {children}
        </TranslationContext.Provider>
    )
}

export function useTranslationContext() {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error('useTranslationContext must be used within a TranslationProvider')
    }
    return context
}
