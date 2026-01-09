"use client"

import { useState, useEffect } from 'react'
import { LanguageSettings } from '@/components/admin/language-settings'
import { getLanguages } from '@/lib/translations'
import { GlobeAltIcon, ShieldCheckIcon, SparklesIcon, TrophyIcon, BookOpenIcon, BeakerIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'

// ...

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('system')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<any>({
        maintenance_mode: false,
        registration_enabled: true,
        guest_browsing_enabled: true,
        global_xp_multiplier: 1.0,
        streak_freeze_limit: 2,
        supported_dialects: [
            { code: 'standard', label: 'Standard' },
            { code: 'zazaki-dimli', label: 'Dersim' }
        ]
    })
    const [languages, setLanguages] = useState<any[]>([])

    useEffect(() => {
        const load = async () => {
            await Promise.all([fetchSettings(), fetchLangs()])
            setLoading(false)
        }
        load()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = await res.json()
                setSettings((prev: any) => ({ ...prev, ...data }))
            }
        } catch (error) {
            console.error('Failed to load settings', error)
        }
    }

    const fetchLangs = async () => {
        try {
            const langs = await getLanguages()
            setLanguages(langs)
        } catch (e) {
            console.error(e)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                alert('Settings saved')
            } else {
                alert('Failed to save')
            }
        } catch (error) {
            console.error('Error saving:', error)
            alert('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }))
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <AdminPage>
            <AdminPageHeader
                title="System Settings"
                description="Configure global application behavior and feature flags."
            />

            <AdminPageContent>
                <div className="bg-white shadow rounded-lg overflow-hidden min-h-[500px] flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 bg-gray-50 border-b border-gray-200">
                            <TabsList>
                                <TabsTrigger value="system">
                                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                    System
                                </TabsTrigger>
                                <TabsTrigger value="gamification">
                                    <TrophyIcon className="w-4 h-4 mr-2" />
                                    Gamification
                                </TabsTrigger>
                                <TabsTrigger value="content">
                                    <BeakerIcon className="w-4 h-4 mr-2" />
                                    Content
                                </TabsTrigger>
                                <TabsTrigger value="languages">
                                    <GlobeAltIcon className="w-4 h-4 mr-2" />
                                    Languages
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 flex-1">
                            {/* System Tab */}
                            <TabsContent value="system" className="mt-0 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Instance Controls</h3>
                                    <div className="space-y-6">
                                        <ToggleSetting
                                            label="Maintenance Mode"
                                            description="Prevent non-admin users from accessing the application."
                                            enabled={settings.maintenance_mode}
                                            onChange={(val) => handleChange('maintenance_mode', val)}
                                            risk="high"
                                        />
                                        <ToggleSetting
                                            label="Registration Enabled"
                                            description="Allow new users to sign up. Existing users can still log in."
                                            enabled={settings.registration_enabled}
                                            onChange={(val) => handleChange('registration_enabled', val)}
                                        />
                                        <ToggleSetting
                                            label="Guest Browsing"
                                            description="Allow users to browse content without an account."
                                            enabled={settings.guest_browsing_enabled}
                                            onChange={(val) => handleChange('guest_browsing_enabled', val)}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Gamification Tab */}
                            <TabsContent value="gamification" className="mt-0 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Economy & Progression</h3>
                                    <div className="grid grid-cols-1 gap-6 max-w-xl">
                                        <div>
                                            <Label htmlFor="xp-multiplier">Global XP Multiplier</Label>
                                            <div className="mt-1 flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    id="xp-multiplier"
                                                    step="0.1"
                                                    min="0.1"
                                                    max="10.0"
                                                    value={settings.global_xp_multiplier}
                                                    onChange={(e) => handleChange('global_xp_multiplier', parseFloat(e.target.value))}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                />
                                                <span className="text-sm text-gray-500">x</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Multiplies all XP earned by users. Useful for special events.
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="streak-freeze-limit">Streak Freeze Limit</Label>
                                            <input
                                                type="number"
                                                id="streak-freeze-limit"
                                                min="0"
                                                max="10"
                                                value={settings.streak_freeze_limit}
                                                onChange={(e) => handleChange('streak_freeze_limit', parseInt(e.target.value))}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Maximum number of streak freezes a user can hold at once.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Content Tab */}
                            <TabsContent value="content" className="mt-0 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Content Utilities</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <Label>Supported Dialects & Categories</Label>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Define the dialects or categories available for courses.
                                            </p>

                                            <div className="bg-gray-50 rounded-md p-4 space-y-3">
                                                {(settings.supported_dialects || []).map((dialect: any, index: number) => (
                                                    <div key={index} className="flex gap-3">
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Code (e.g. zazaki-dimli)"
                                                                value={dialect.code}
                                                                onChange={(e) => {
                                                                    const newDialects = [...(settings.supported_dialects || [])]
                                                                    newDialects[index].code = e.target.value
                                                                    handleChange('supported_dialects', newDialects)
                                                                }}
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Label (e.g. Dersim)"
                                                                value={dialect.label}
                                                                onChange={(e) => {
                                                                    const newDialects = [...(settings.supported_dialects || [])]
                                                                    newDialects[index].label = e.target.value
                                                                    handleChange('supported_dialects', newDialects)
                                                                }}
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newDialects = settings.supported_dialects.filter((_: any, i: number) => i !== index)
                                                                handleChange('supported_dialects', newDialects)
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => {
                                                        const newDialects = [...(settings.supported_dialects || []), { code: '', label: '' }]
                                                        handleChange('supported_dialects', newDialects)
                                                    }}
                                                    className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-700"
                                                >
                                                    <PlusIcon className="w-4 h-4 mr-1" />
                                                    Add Dialect
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Languages Tab */}
                            <TabsContent value="languages" className="mt-0">
                                <LanguageSettings languages={languages} />
                            </TabsContent>

                            {/* Save Button Footer */}
                            {activeTab !== 'languages' && (
                                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </AdminPageContent>
        </AdminPage>
    )
}
// ...

function ToggleSetting({ label, description, enabled, onChange, risk }: {
    label: string,
    description: string,
    enabled: boolean,
    onChange: (val: boolean) => void,
    risk?: 'high' | 'normal'
}) {
    const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`
    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
                <Label htmlFor={id} className={`text-base font-medium leading-none ${risk === 'high' ? 'text-red-900' : 'text-gray-900'}`}>
                    {label} {risk === 'high' && <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Caution</span>}
                </Label>
                <p className="text-sm text-gray-500">
                    {description}
                </p>
            </div>
            <Switch
                id={id}
                checked={enabled}
                onCheckedChange={onChange}
            />
        </div>
    )
}
