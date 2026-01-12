'use client'

import { useState } from 'react'
import { updateSystemSetting } from '@/app/actions/system-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface NotificationSettingsFormProps {
    initialSettings: Record<string, any>
}

// Default templates if nothing is saved in DB
const DEFAULTS = {
    daily_challenge: "Heute wartet eine neue Challenge auf dich! 🚀",
    streak_saver: "Achtung! Dein {streak}-Tage Streak ist in Gefahr! 😱",
    inactivity: "Wir vermissen dich! Komm zurück und lerne weiter. 👋"
}

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState(initialSettings)

    // Helper to get value or default
    const getValue = (key: string, defaultVal: any) => {
        return settings[key] ?? defaultVal
    }

    const handleToggle = async (key: string, checked: boolean) => {
        setSettings(prev => ({ ...prev, [key]: checked }))
        // Auto-save toggles
        try {
            await updateSystemSetting(key, checked)
            toast.success('Saved')
        } catch (e) {
            toast.error('Failed to save')
        }
    }

    const handleTextChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const saveTemplate = async (key: string) => {
        setLoading(true)
        try {
            await updateSystemSetting(key, settings[key])
            toast.success('Template saved')
        } catch (e) {
            toast.error('Failed to save template')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            {/* Global Master Switch */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Global Automation</CardTitle>
                    <CardDescription className="dark:text-gray-400">Master switch for all automated push notifications.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center space-x-4">
                    <Switch
                        id="global-push"
                        checked={getValue('push_global_enabled', false)}
                        onCheckedChange={(c) => handleToggle('push_global_enabled', c)}
                    />
                    <Label htmlFor="global-push" className="dark:text-gray-200">Enable Automated Pushes</Label>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Daily Challenge */}
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="dark:text-gray-100">Daily Challenge</CardTitle>
                            <Switch
                                checked={getValue('push_daily_challenge_enabled', false)}
                                onCheckedChange={(c) => handleToggle('push_daily_challenge_enabled', c)}
                                disabled={!getValue('push_global_enabled', false)}
                            />
                        </div>
                        <CardDescription className="dark:text-gray-400">Sent every morning to all subscribed users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="dark:text-gray-200">Message Template (German)</Label>
                            <Textarea
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                value={getValue('push_template_daily_challenge', DEFAULTS.daily_challenge)}
                                onChange={(e) => handleTextChange('push_template_daily_challenge', e.target.value)}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground dark:text-gray-500">Available variables: <code>{'{username}'}</code></p>
                        </div>
                        <Button
                            onClick={() => saveTemplate('push_template_daily_challenge')}
                            disabled={loading}
                            size="sm"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Template
                        </Button>
                    </CardContent>
                </Card>

                {/* Streak Saver */}
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="dark:text-gray-100">Streak Saver</CardTitle>
                            <Switch
                                checked={getValue('push_streak_saver_enabled', false)}
                                onCheckedChange={(c) => handleToggle('push_streak_saver_enabled', c)}
                                disabled={!getValue('push_global_enabled', false)}
                            />
                        </div>
                        <CardDescription className="dark:text-gray-400">Sent in the evening to users at risk of breaking streak.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="dark:text-gray-200">Message Template (German)</Label>
                            <Textarea
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                value={getValue('push_template_streak_saver', DEFAULTS.streak_saver)}
                                onChange={(e) => handleTextChange('push_template_streak_saver', e.target.value)}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground dark:text-gray-500">Available variables: <code>{'{streak}'}</code>, <code>{'{username}'}</code></p>
                        </div>
                        <Button
                            onClick={() => saveTemplate('push_template_streak_saver')}
                            disabled={loading}
                            size="sm"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Template
                        </Button>
                    </CardContent>
                </Card>

                {/* Inactivity */}
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="dark:text-gray-100">Inactivity Rescue</CardTitle>
                            <Switch
                                checked={getValue('push_inactivity_enabled', false)}
                                onCheckedChange={(c) => handleToggle('push_inactivity_enabled', c)}
                                disabled={!getValue('push_global_enabled', false)}
                            />
                        </div>
                        <CardDescription className="dark:text-gray-400">Sent after 3 days of inactivity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="dark:text-gray-200">Message Template (German)</Label>
                            <Textarea
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                value={getValue('push_template_inactivity', DEFAULTS.inactivity)}
                                onChange={(e) => handleTextChange('push_template_inactivity', e.target.value)}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground dark:text-gray-500">Available variables: <code>{'{username}'}</code></p>
                        </div>
                        <Button
                            onClick={() => saveTemplate('push_template_inactivity')}
                            disabled={loading}
                            size="sm"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Template
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
