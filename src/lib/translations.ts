'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type Locale = string
export type Dictionary = Record<string, string>

// Fetch all translations and return as a key-value pair for a specific locale
// Fallback to German (de) if translation for locale is missing
export async function getDictionary(locale: Locale = 'de'): Promise<Dictionary> {
    const translations = await prisma.translation.findMany()

    const dictionary: Dictionary = {}

    translations.forEach((t) => {
        const values = t.values as Record<string, string>
        // Priority: Requested Locale -> German (Base) -> Key itself (if needed, but usually we want a fallback)
        // Requirement says "German base strings", so fallback to 'de' makes sense.
        dictionary[t.key] = values[locale] || values['de'] || t.key
    })

    return dictionary
}

// Admin: Get all raw translations with all languages
export async function getAllTranslations() {
    return await prisma.translation.findMany({
        orderBy: { key: 'asc' }
    })
}

// Admin: Get all active languages
export async function getLanguages() {
    // Ensure we at least return the hardcoded base ones if DB is empty, 
    // but better to rely on DB state.
    // We'll seed DE and EN if they don't exist.
    const languages = await prisma.language.findMany({
        orderBy: { code: 'asc' }
    })

    if (languages.length === 0) {
        // Seed initial languages if none exist
        await prisma.language.createMany({
            data: [
                { code: 'de', name: 'German' },
                { code: 'en', name: 'English' },
                { code: 'tr', name: 'Turkish' },
            ],
            skipDuplicates: true
        })
        return await prisma.language.findMany({ orderBy: { code: 'asc' } })
    }

    return languages
}

// Server Action: Update or Create a translation key
export async function updateTranslation(key: string, values: Record<string, string>) {
    // Check if it exists first to merge or replace? 
    // For simplicity, we can just upsert, but we want to merge if we are only sending partial updates?
    // The Admin UI will likely send the whole row state.
    // Let's fetch existing to merge if we want to be safe, or just overwrite.
    // Requirement: "all strings should be available in these settings"

    const existing = await prisma.translation.findUnique({ where: { key } })
    const newValues = existing ? { ...(existing.values as Record<string, string>), ...values } : values

    await prisma.translation.upsert({
        where: { key },
        update: { values: newValues },
        create: { key, values: newValues }
    })

    revalidatePath('/')
    revalidatePath('/admin/translations')
}

// Server Action: Add a new language
export async function addLanguage(code: string, name: string) {
    await prisma.language.create({
        data: { code, name }
    })
    revalidatePath('/admin/translations')
}

// Server Action: Delete a translation key
export async function deleteTranslation(key: string) {
    await prisma.translation.delete({ where: { key } })
    revalidatePath('/admin/translations')
}

// Server Action: Delete a language
export async function deleteLanguage(code: string) {
    // Prevent deleting 'de' logic can be handled in UI or here
    if (code === 'de') throw new Error('Cannot delete default language')
    await prisma.language.delete({ where: { code } })
    revalidatePath('/admin/translations')
    revalidatePath('/admin/settings')
}

// Server Action: Toggle language active status
export async function toggleLanguageStatus(code: string, isActive: boolean) {
    if (code === 'de' && !isActive) throw new Error('Cannot disable default language')
    await prisma.language.update({
        where: { code },
        data: { isActive }
    })
    revalidatePath('/admin/translations')
    revalidatePath('/admin/settings')
}
w