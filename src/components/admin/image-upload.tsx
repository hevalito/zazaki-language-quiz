"use client"

import { useState, useRef } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
    value: string // Current URL
    onChange: (url: string) => void
    label?: string
    disabled?: boolean
}

export function ImageUpload({ value, onChange, label = "Image", disabled = false }: ImageUploadProps) {
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            onChange(data.url)
        } catch (error) {
            console.error(error)
            alert('Failed to upload image')
        } finally {
            setLoading(false)
            // Reset input so executing the same file again triggers onChange
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemove = () => {
        onChange('')
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>

            {value ? (
                <div className="relative w-32 h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={disabled}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 shadow-sm"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !disabled && !loading && fileInputRef.current?.click()}
                    className={`
                        w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${disabled || loading ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800'}
                    `}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400" />
                    ) : (
                        <>
                            <PhotoIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Upload</span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={disabled || loading}
                className="hidden"
            />
            {value && <p className="mt-2 text-xs text-gray-500 break-all">{value}</p>}
        </div>
    )
}
