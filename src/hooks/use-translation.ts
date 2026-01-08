'use client'

import { useTranslationContext } from '@/components/providers/translation-provider'

export function useTranslation() {
    const { dictionary } = useTranslationContext()

    function t(key: string, fallback?: string): string {
        return dictionary[key] || fallback || key
    }

    return { t }
}

export { useTranslationContext } from '@/components/providers/translation-provider'
