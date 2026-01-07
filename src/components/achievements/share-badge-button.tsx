"use client"

import { ShareIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface ShareBadgeButtonProps {
    title: string
    description: string
    shareId?: string
}

export function ShareBadgeButton({ title, description, shareId }: ShareBadgeButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        // If shareId provided, build the public public URL, otherwise fallback to current location
        const url = shareId
            ? `${window.location.origin}/share/achievement/${shareId}`
            : window.location.href

        const shareData = {
            title: `Ich habe einen Erfolg freigeschaltet: ${title}! 🏆`,
            text: `Ich habe gerade den Erfolg "${title}" in Zazakî Quiz freigeschaltet! ${description}`,
            url
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }
    }

    return (
        <button
            onClick={handleShare}
            className="btn-secondary w-full flex items-center justify-center space-x-2 group"
        >
            {copied ? (
                <>
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-green-600">Kopiert!</span>
                </>
            ) : (
                <>
                    <ShareIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                    <span>Erfolg teilen</span>
                </>
            )}
        </button>
    )
}
