"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { LanguageTabs } from './language-tabs'
import { ImageUpload } from './image-upload'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface BadgeFormProps {
    initialData?: any
    isEditing?: boolean
}

import { getLanguages } from '@/lib/translations'

// ...

export function BadgeForm({ initialData, isEditing = false }: BadgeFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [languages, setLanguages] = useState<any[]>([])
    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        title: initialData?.title || {},
        description: initialData?.description || {},
        iconUrl: initialData?.iconUrl || '🏆',
        imageUrl: initialData?.imageUrl || '',
        iconType: initialData?.imageUrl ? 'image' : 'emoji',
        conditionLabel: initialData?.conditionLabel || {},
        criteriaType: initialData?.criteria?.type || 'lesson_completion',
        criteriaValue: initialData?.criteria?.level || initialData?.criteria?.value || initialData?.criteria?.count || 1,
        isActive: initialData?.isActive ?? true
    })

    useEffect(() => {
        getLanguages().then(langs => {
            setLanguages(langs)
            // Ensure keys exist for all langs
            setFormData(prev => {
                const newTitle = { ...prev.title }
                const newDesc = { ...prev.description }
                const newLabel = { ...prev.conditionLabel }

                langs.forEach((l: any) => {
                    if (!newTitle[l.code]) newTitle[l.code] = ''
                    if (!newDesc[l.code]) newDesc[l.code] = ''
                    if (!newLabel[l.code]) newLabel[l.code] = ''
                })

                return {
                    ...prev,
                    title: newTitle,
                    description: newDesc,
                    conditionLabel: newLabel
                }
            })
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                code: formData.code,
                title: formData.title,
                description: formData.description,
                iconUrl: formData.iconType === 'emoji' ? formData.iconUrl : null,
                imageUrl: formData.iconType === 'image' ? formData.imageUrl : null,
                conditionLabel: formData.conditionLabel,
                criteria: formData.criteriaType === 'level_reached'
                    ? { type: 'level_reached', level: formData.criteriaValue }
                    : { type: formData.criteriaType, count: Number(formData.criteriaValue) },
                isActive: formData.isActive
            }

            const url = isEditing
                ? `/api/admin/badges/${initialData.id}`
                : '/api/admin/badges'

            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                router.push('/admin/achievements')
                router.refresh()
            } else {
                alert('Something went wrong')
            }
        } catch (error) {
            console.error(error)
            alert('Error saving badge')
        } finally {
            setLoading(false)
        }
    }

    const onEmojiClick = (emojiObject: any) => {
        setFormData(prev => ({ ...prev, iconUrl: emojiObject.emoji }))
        setShowEmojiPicker(false)
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Form */}
            <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                        {/* Code */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Code (Unique ID)</label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                placeholder="e.g. first_win"
                            />
                        </div>

                        {/* Icon Type Selection */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Icon Type</label>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={formData.iconType === 'emoji'}
                                        onChange={() => setFormData({ ...formData, iconType: 'emoji' })}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Emoji</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={formData.iconType === 'image'}
                                        onChange={() => setFormData({ ...formData, iconType: 'image' })}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Custom Image</span>
                                </label>
                            </div>
                        </div>

                        {/* Emoji Picker */}
                        {formData.iconType === 'emoji' && (
                            <div className="sm:col-span-6 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50 bg-white text-3xl transition-colors"
                                >
                                    {formData.iconUrl || '🏆'}
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute z-10 mt-2">
                                        <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="relative z-20">
                                            <EmojiPicker onEmojiClick={onEmojiClick} width={350} height={400} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Image URL Input */}
                        {formData.iconType === 'image' && (
                            <div className="sm:col-span-6">
                                <ImageUpload
                                    value={formData.imageUrl || ''}
                                    onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                    label="Badge Image"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Recommended: Square image (1:1), PNG or JPG. Will be masked as a circle.
                                </p>
                            </div>
                        )}

                        {/* Language Specific Content */}
                        <div className="sm:col-span-6">
                            {languages.length > 0 && (
                                <LanguageTabs languages={languages}>
                                    {(lang) => {
                                        const langName = languages.find(l => l.code === lang)?.name || lang
                                        return (
                                            <div className="space-y-6">
                                                {/* Title */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Title ({langName})
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required={lang === 'de'}
                                                        value={formData.title[lang] || ''}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            title: { ...formData.title, [lang]: e.target.value }
                                                        })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                    />
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Description ({langName})
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        value={formData.description[lang] || ''}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            description: { ...formData.description, [lang]: e.target.value }
                                                        })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                    />
                                                </div>

                                                {/* Condition Label */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Condition Label ({langName})
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.conditionLabel[lang] || ''}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            conditionLabel: { ...formData.conditionLabel, [lang]: e.target.value }
                                                        })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                        placeholder={lang === 'de' ? 'z.B. 1000 XP' : 'e.g. 1000 XP'}
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Shown in bold to describe the requirement.
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }}
                                </LanguageTabs>
                            )}
                        </div>

                        {/* Criteria Type */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Criteria Type</label>
                            <select
                                value={formData.criteriaType}
                                onChange={e => setFormData({ ...formData, criteriaType: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            >
                                <option value="lesson_completion">Lesson Completion</option>
                                <option value="streak">Streak</option>
                                <option value="total_xp">Total XP</option>
                                <option value="level_reached">Level Reached</option>
                                <option value="total_quizzes">Total Quizzes</option>
                                <option value="perfect_score_streak">Perfect Score Streak</option>
                            </select>
                        </div>

                        {/* Criteria Value */}
                        {formData.criteriaType === 'level_reached' ? (
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Required Level</label>
                                <select
                                    value={formData.criteriaValue}
                                    onChange={e => setFormData({ ...formData, criteriaValue: e.target.value as any })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                >
                                    <option value="A1">A1 - Beginner</option>
                                    <option value="A2">A2 - Elementary</option>
                                    <option value="B1">B1 - Intermediate</option>
                                    <option value="B2">B2 - Upper Intermediate</option>
                                    <option value="C1">C1 - Advanced</option>
                                    <option value="C2">C2 - Mastery</option>
                                </select>
                            </div>
                        ) : (
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    {formData.criteriaType === 'total_xp' ? 'XP Needed' :
                                        formData.criteriaType === 'streak' ? 'Days Streak' :
                                            'Count'}
                                </label>
                                <input
                                    type="number"
                                    value={formData.criteriaValue}
                                    onChange={e => setFormData({ ...formData, criteriaValue: Number(e.target.value) })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                />
                            </div>
                        )}

                        {/* Active Status */}
                        <div className="sm:col-span-6">
                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isActive" className="font-medium text-gray-700">Active</label>
                                    <p className="text-gray-500">Users can earn this badge.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end pt-5">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/achievements')}
                            className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Badge'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Column: Live Preview */}
            <div className="w-full lg:w-96">
                <div className="sticky top-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        {/* Preview Header - simulating dashboard context */}
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Achievement Unlocked
                        </div>

                        <div className="p-6 flex flex-col items-center text-center">
                            {/* Animated Background Glow Effect (simulated) */}
                            <div className="relative">
                                <div className={`absolute inset-0 bg-yellow-400 blur-xl opacity-20 rounded-full animate-pulse`} />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-4 text-5xl">
                                    {formData.iconUrl || '🏆'}
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-gray-900 mb-1">
                                {formData.title.de || formData.title.en || 'Badge Title'}
                            </h4>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-[240px]">
                                {formData.description.de || formData.description.en || 'Badge description will appear here.'}
                            </p>

                            {/* Progress bar simulation */}
                            <div className="w-full mt-6 bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="mt-2 text-xs font-medium text-green-600">
                                Unlocked!
                            </div>
                        </div>

                        {/* Technical Details Footer */}
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-500">Type:</span>
                                <span className="ml-1 font-medium text-gray-900">{formData.criteriaType}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500">Target:</span>
                                <span className="ml-1 font-medium text-gray-900">{formData.criteriaValue}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                        <strong className="block mb-1 font-medium">✨ Pro Tip</strong>
                        Use an engaging emoji and a short, motivating description to encourage users!
                    </div>
                </div>
            </div>
        </div>
    )
}
