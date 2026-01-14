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

    // 1. Create Parent History Record FIRST
    const history = await prisma.notificationHistory.create({
        data: {
            title,
            body,
            url,
            type,
            sentCount: 0, // Will update later
            failedCount: 0,
            sentByUserId: sentByUserId === 'SYSTEM' ? null : sentByUserId
        }
    })

    const payloadBase = {
        title,
        body,
        url: url || '/',
        actions: [
            { action: 'open', title: 'Start' }
        ]
    }

    let successCount = 0
    let failureCount = 0
    let removedCount = 0

    // 2. Send and Create Recipient Records
    const promises = subscriptions.map(async (sub) => {
        // Create recipient record first to get ID? Or sending first?
        // Let's create the record to get an ID for tracking, then send.
        // If send fails, update status.

        let recipientId: string | undefined

        // Try to find user ID from subscription? The subscription object passed in usually has it if we included it.
        // But `sendPushBatch` signature just says `subscriptions: any[]`.
        // We need to ensure the caller passes subscriptions with user context if we want to link it.
        // Assuming `sub.userId` exists or `sub.user.id`.
        const userId = sub.userId || sub.user?.id

        if (userId) {
            try {
                const recipient = await prisma.notificationRecipient.create({
                    data: {
                        notificationHistoryId: history.id,
                        userId: userId,
                        status: 'QUEUED'
                    }
                })
                recipientId = recipient.id
            } catch (e) {
                console.error('Failed to create recipient record', e)
            }
        }

        // Add tracking data
        const payload = JSON.stringify({
            ...payloadBase,
            data: {
                ...payloadBase,
                notificationId: recipientId // This is the key for open tracking!
            }
        })

        try {
            await webPush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }, payload)

            successCount++
            if (recipientId) {
                await prisma.notificationRecipient.update({
                    where: { id: recipientId },
                    data: { status: 'SENT' }
                })
            }
        } catch (err: any) {
            failureCount++
            if (recipientId) {
                await prisma.notificationRecipient.update({
                    where: { id: recipientId },
                    data: {
                        status: 'FAILED',
                        error: err.message || 'Unknown error'
                    }
                })
            }

            if (err.statusCode === 410 || err.statusCode === 404) {
                removedCount++
                // Clean up dead subscription
                await prisma.pushSubscription.delete({ where: { id: sub.id } })
            }
            console.error(`Failed to send push to ${sub.id}:`, err)
        }
    })

    await Promise.all(promises)

    // 3. Update Parent Counts
    await prisma.notificationHistory.update({
        where: { id: history.id },
        data: {
            sentCount: successCount,
            failedCount: failureCount
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
