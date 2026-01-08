'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export type TranslationResult = {
    translatedText: string | null
    error?: string
}

export async function translateText(
    text: string,
    targetLanguage: string,
    displayLanguageName: string, // e.g. "Turkish" for detecting context
    sourceLanguage = 'German'
): Promise<TranslationResult> {
    if (!text || !text.trim()) {
        return { translatedText: '' }
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error('Missing OPENAI_API_KEY')
        return { translatedText: null, error: 'API Key missing' }
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Or gpt-3.5-turbo if cost is a concern, but 4o is better for minority languages
            messages: [
                {
                    role: "system",
                    content: `You are an expert linguist and translator specializing in Zazakî (Dimilî/Zaza) and German.
                    
                    TASK:
                    Translate the given text from ${sourceLanguage} to ${displayLanguageName}.
                    
                    CRITICAL RULES:
                    1. **Preserve Zazakî**: The source text often contains Zazakî words or phrases mixed with German. You MUST NOT translate Zazakî words. Keep them exactly as they are.
                       - Zazakî examples: "Pepo", "Xêr ama", "Spas", "Rojbaş", names of characters like "Pepo".
                       - Example: Source "Pepo! Bald hast du es geschafft!" -> Target (Turkish) "Pepo! Yakında başaracaksın!" (Pepo is kept).
                    2. **Preserve Proper Names**: Do not translate proper names (people, places).
                    3. **Output ONLY the translation**: Do not provide explanations, notes, or conversational filler. Just the translated string.
                    4. **Tone**: Casual, friendly, suitable for a mobile game app.
                    
                    Input Text: "${text}"`
                }
            ],
            temperature: 0.3,
        })

        const translatedText = completion.choices[0].message.content?.trim() || null

        return { translatedText }
    } catch (error) {
        console.error('OpenAI Translation Error:', error)
        return { translatedText: null, error: 'Failed to translate' }
    }
}
