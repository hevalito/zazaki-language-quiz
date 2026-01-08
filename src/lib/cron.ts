import { NextRequest, NextResponse } from 'next/server'
import webPush from 'web-push'
import { prisma } from '@/lib/prisma'

export function validateCronSecret(req: NextRequest): boolean {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return false
    }
    return true
}

export async function sendPushBatch({
    subscriptions,
    title,
    body,
    url,
    type,
    sentByUserId = 'SYSTEM'
}: {
    subscriptions: any[]
    title: string
    body: string
    url?: string
    type: string
    sentByUserId?: string
}) {
    if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        console.error('VAPID keys not configured')
        return { success: 0, failed: 0, removed: 0 }
    }

    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@zazaki.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )

    const payload = JSON.stringify({
        title,
        body,
        url: url || '/',
        actions: [
            { action: 'open', title: 'Start' }
        ]
    })

    let successCount = 0
    let failureCount = 0
    let removedCount = 0

    const promises = subscriptions.map((sub) =>
        webPush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        }, payload)
            .then(() => {
                successCount++
            })
            .catch((err) => {
                failureCount++
                if (err.statusCode === 410 || err.statusCode === 404) {
                    removedCount++
                    // Clean up dead subscription
                    return prisma.pushSubscription.delete({ where: { id: sub.id } })
                }
                console.error(`Failed to send push to ${sub.id}:`, err)
            })
    )

    await Promise.all(promises)

    // Log to history
    // Note: sentByUserId needs to be a valid User ID if provided, or null/undefined if system.
    // Since 'SYSTEM' isn't a valid ID, we'll leave it undefined if it's the default string, 
    // or we need to ensure the schema supports it. Schema has sentByUserId as String? connected to User.
    // So if it's system, we must leave it null.

    await prisma.notificationHistory.create({
        data: {
            title,
            body,
            url,
            type,
            sentCount: successCount,
            failedCount: failureCount,
            sentByUserId: sentByUserId === 'SYSTEM' ? null : sentByUserId
        }
    })

    return {
        success: successCount,
        failed: failureCount,
        removed: removedCount
    }
}

// Helper to check if a specific cron job type is enabled
export async function shouldRunCron(type: string): Promise<boolean> {
    // 1. Check Global Switch
    const globalEnabled = await prisma.systemSetting.findUnique({
        where: { key: 'push_global_enabled' }
    })

    if (globalEnabled && globalEnabled.value === false) {
        console.log('Global push notifications are disabled.')
        return false
    }

    // 2. Check Specific Switch
    const specificEnabled = await prisma.systemSetting.findUnique({
        where: { key: `push_${type}_enabled` }
    })

    // If specific setting doesn't exist, default to FALSE for safety (opt-in)
    if (!specificEnabled || specificEnabled.value === false) {
        console.log(`Push notifications for ${type} are disabled.`)
        return false
    }

    return true
}

// Helper to get template message
export async function getNotificationTemplate(type: string, defaultTemplate: string): Promise<string> {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: `push_template_${type}` }
    })

    if (setting?.value && typeof setting.value === 'string') {
        return setting.value
    }

    return defaultTemplate
}

// Helper to replace variables in template
// Supports {username}, {streak}, etc.
export function replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }
    return result
}
