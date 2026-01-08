'use client'

import { useState, useEffect } from 'react'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    ShieldCheckIcon,
    TrophyIcon,
    BeakerIcon
} from '@heroicons/react/24/outline'

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

    useEffect(() => {
        fetchSettings()
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
        } finally {
            setLoading(false)
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
                alert('Settings saved successfully')
            } else {
                alert('Failed to save settings')
            }
        } catch (error) {
            console.error('Failed to save', error)
            alert('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }))
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>

    return (
        <AdminPage>
            <AdminPageHeader
                title="Settings"
                description="Configure global application behavior and parameters."
                actions={
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                }
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
                            </TabsList>
                        </div>

                        <div className="p-6 flex-1">
                            {/* System Tab */}
                            <TabsContent value="system" className="mt-0 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">System Access</h3>
                                    <div className="space-y-6 max-w-3xl">
                                        <ToggleSetting
                                            label="Maintenance Mode"
                                            description="If enabled, only administrators can access the application. Useful for updates."
                                            enabled={settings.maintenance_mode}
                                            onChange={(val) => handleChange('maintenance_mode', val)}
                                            risk="high"
                                        />
                                        <div className="border-t border-gray-100" />
                                        <ToggleSetting
                                            label="Enable New Registrations"
                                            description="Allow new users to sign up. Disable to close the platform to new members."
                                            enabled={settings.registration_enabled}
                                            onChange={(val) => handleChange('registration_enabled', val)}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Gamification Tab */}
                            <TabsContent value="gamification" className="mt-0 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Gamification Config</h3>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2 max-w-3xl">
                                        <div>
                                            <Label htmlFor="xp-multiplier" className="text-sm font-medium leading-6 text-gray-900">
                                                Global XP Multiplier
                                            </Label>
                                            <div className="mt-2">
                                                <input
                                                    type="number"
                                                    name="xp-multiplier"
                                                    id="xp-multiplier"
                                                    step="0.1"
                                                    min="0.1"
                                                    value={settings.global_xp_multiplier}
                                                    onChange={(e) => handleChange('global_xp_multiplier', parseFloat(e.target.value))}
                                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Default is 1.0. Set to 2.0 for Double XP events.
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="streak-freeze" className="text-sm font-medium leading-6 text-gray-900">
                                                Max Streak Freezes
                                            </Label>
                                            <div className="mt-2">
                                                <input
                                                    type="number"
                                                    name="streak-freeze"
                                                    id="streak-freeze"
                                                    min="0"
                                                    step="1"
                                                    value={settings.streak_freeze_limit}
                                                    onChange={(e) => handleChange('streak_freeze_limit', parseInt(e.target.value))}
                                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    The maximum number of missed days a user can hold.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Content Tab */}
                            <TabsContent value="content" className="mt-0 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Content Visibility</h3>
                                    <div className="space-y-6 max-w-3xl">
                                        <ToggleSetting
                                            label="Guest Browsing"
                                            description="Allow non-logged-in visitors to view the course catalog and curriculum."
                                            enabled={settings.guest_browsing_enabled}
                                            onChange={(val) => handleChange('guest_browsing_enabled', val)}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </AdminPageContent>
        </AdminPage>
    )
}

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
