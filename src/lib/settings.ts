import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export type SystemSettings = {
    maintenance_mode: boolean
    registration_enabled: boolean
    guest_browsing_enabled: boolean
    global_xp_multiplier: number
    streak_freeze_limit: number
}

const DEFAULT_SETTINGS: SystemSettings = {
    maintenance_mode: false,
    registration_enabled: true,
    guest_browsing_enabled: true,
    global_xp_multiplier: 1.0,
    streak_freeze_limit: 2,
}

// Cache tag for revalidation
export const SETTINGS_CACHE_TAG = 'system-settings'

export const getSystemSettings = unstable_cache(
    async (): Promise<SystemSettings> => {
        try {
            const settings = await prisma.systemSetting.findMany()
            const settingsMap = settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value
                return acc
            }, {} as Record<string, any>)

            // Merge with defaults
            return { ...DEFAULT_SETTINGS, ...settingsMap }
        } catch (error) {
            console.error('Failed to fetch system settings:', error)
            return DEFAULT_SETTINGS
        }
    },
    ['system-settings-key'],
    {
        tags: [SETTINGS_CACHE_TAG],
        revalidate: 60 // Revalidate every minute as a fallback
    }
)

// Helper to manually invalidate cache (call this in your admin API)
// import { revalidateTag } from 'next/cache'
// revalidateTag(SETTINGS_CACHE_TAG)
