"use client"

import { useState, useEffect } from 'react'
import { LanguageSettings } from '@/components/admin/language-settings'
import { getLanguages } from '@/lib/translations'
import { GlobeAltIcon, ShieldCheckIcon, SparklesIcon, TrophyIcon, BookOpenIcon, BeakerIcon } from '@heroicons/react/24/outline'
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
                method: 'PUT',
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
                                {/* ... */}
                            </TabsContent>

                            {/* Gamification Tab */}
                            <TabsContent value="gamification" className="mt-0 space-y-8">
                                {/* ... */}
                            </TabsContent>

                            {/* Content Tab */}
                            <TabsContent value="content" className="mt-0 space-y-8">
                                {/* ... */}
                            </TabsContent>

                            {/* Languages Tab */}
                            <TabsContent value="languages" className="mt-0">
                                <LanguageSettings languages={languages} />
                            </TabsContent>
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
