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
    sourceLanguage = 'German'
): Promise<TranslationResult> {
    if (!text || !text.trim()) {
        return { translatedText: '' }
    }

    console.log(`[AI Translation] Request: "${text}" -> ${targetLanguage} (Source: ${sourceLanguage})`)

    if (!process.env.OPENAI_API_KEY) {
        console.error('[AI Translation] Missing OPENAI_API_KEY')
        return { translatedText: null, error: 'API Key missing' }
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert linguist and translator specializing in Zazakî (Dimilî/Zaza) and German.
                    
                    TASK:
                    Translate the given text from ${sourceLanguage} to ${targetLanguage}.
                    
                    CRITICAL RULES:
                    1. **Preserve Zazakî**: The source text often contains Zazakî words or phrases mixed with German. You MUST NOT translate Zazakî words. Keep them exactly as they are.
                       - Zazakî examples: "Pepo", "Xêr ama", "Spas", "Rojbaş", names of characters like "Pepo".
                       - Example: Source "Pepo! Bald hast du es geschafft!" -> Target (Turkish) "Pepo! Yakında başaracaksın!" (Pepo is kept).
                    2. **Preserve Proper Names**: Do not translate proper names (people, places).
                    3. **Output ONLY the translation**: Do not provide explanations, notes, or conversational filler. Just the translated string.
                    4. **No Quotes**: Do not wrap the output in quotes unless they are part of the text itself.
                    5. **Tone**: Casual, friendly, suitable for a mobile game app.
                    
                    Input Text: "${text}"`
                }
            ],
            temperature: 0.3,
        })

        let translatedText = completion.choices[0].message.content?.trim() || null

        // Post-processing: Remove wrapping quotes if source didn't have them
        if (translatedText && translatedText.startsWith('"') && translatedText.endsWith('"') && !text.startsWith('"')) {
            translatedText = translatedText.slice(1, -1)
        }

        console.log(`[AI Translation] Response: "${translatedText}"`)

        return { translatedText }
    } catch (error) {
        console.error('OpenAI Translation Error:', error)
        return { translatedText: null, error: 'Failed to translate' }
    }
}

export async function translateBatch(
    items: { key: string; sourceText: string }[],
    targetLanguage: string,
    sourceLanguage = 'German'
): Promise<{ [key: string]: string }> {
    if (!items.length) return {}

    console.log(`[AI Batch] Translating ${items.length} items to ${targetLanguage}`)

    if (!process.env.OPENAI_API_KEY) {
        console.error('[AI Batch] Missing OPENAI_API_KEY')
        return {}
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an expert linguist translator. 
                    
                    TASK:
                    Translate the JSON object of source strings from ${sourceLanguage} to ${targetLanguage}.
                    Return a JSON object where keys are the same IDs provided and values are the translations.

                    CRITICAL RULES:
                    1. **Preserve Zazakî**: Source text contains Zazakî/Dimilî words. DO NOT translate them. Keep them exactly as is.
                       - Examples: "Pepo", "Xêr ama", "Spas", "Rojbaş".
                    2. **Preserve Proper Names**: Do not translate names.
                    3. **No Quotes**: Do not add extra quotes.
                    4. **Tone**: Casual, friendly, mobile game style.
                    
                    Input format: { "id1": "text1", "id2": "text2" }
                    Output format: { "id1": "translated1", "id2": "translated2" }`
                },
                {
                    role: "user",
                    content: JSON.stringify(
                        items.reduce((acc, item) => ({ ...acc, [item.key]: item.sourceText }), {})
                    )
                }
            ],
            temperature: 0.3,
        })

        const content = completion.choices[0].message.content
        if (!content) return {}

        const results = JSON.parse(content)
        return results
    } catch (error) {
        console.error('OpenAI Batch Error:', error)
        return {}
    }
}
