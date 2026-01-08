import { getAllTranslations, getLanguages } from '@/lib/translations'
import { TranslationManager } from '@/components/admin/translation-manager'

export default async function TranslationsPage() {
    const translations = await getAllTranslations()
    const languages = await getLanguages()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Translations</h1>
                <p className="text-muted-foreground">
                    Manage application strings and languages.
                </p>
            </div>

            <TranslationManager
                initialTranslations={translations}
                languages={languages}
            />
        </div>
    )
}
