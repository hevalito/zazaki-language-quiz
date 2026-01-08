import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCronSecret, sendPushBatch, shouldRunCron, getNotificationTemplate, replaceVariables } from '@/lib/cron'

export async function POST(req: NextRequest) {
    // 1. Validate Secret
    if (!validateCronSecret(req)) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Check System Settings
    if (!await shouldRunCron('daily_challenge')) {
        return NextResponse.json({ skipped: true, reason: 'Disabled in settings' })
    }

    try {
        // 3. Get Template
        const template = await getNotificationTemplate(
            'daily_challenge',
            'Heute wartet eine neue Challenge auf dich! 🚀'
        )

        // 4. Fetch Target Audience
        // - Subscribed users
        // - notifyDaily: true
        // - Haven't completed a quiz today (Attempt in last 24h? Or simpler: just send morning reminder)
        // Optimization: For the "Morning Reminder", we just send to everyone who wants daily notifications.
        // Checking "has completed today" is technically weird for a 9am cron job (most haven't).
        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                user: {
                    notifyDaily: true
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        nickname: true
                    }
                }
            }
        })

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No subscriptions found' })
        }

        // 5. Send individually to handle variable replacement per user
        // (Batching is harder with personalized content, so we parallelize indiv/small batches)
        // For simpler "blast", we could use sendPushBatch if no variables.
        // But requested req is "editable incl. variables".

        // We'll group by user to send personalized
        let successCount = 0
        let failureCount = 0

        const promises = subscriptions.map(async (sub) => {
            const name = sub.user.nickname || sub.user.name || 'Champion'
            const msg = replaceVariables(template, { username: name })

            // Reuse the single-send logic from sendPushBatch or call it for size=1 array
            const result = await sendPushBatch({
                subscriptions: [sub], // Array of 1
                title: 'Daily Challenge',
                body: msg,
                url: '/quiz/daily',
                type: 'DAILY_CHALLENGE',
                sentByUserId: 'SYSTEM'
            })
            successCount += result.success
            failureCount += result.failed
        })

        await Promise.all(promises)

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount
        })

    } catch (error) {
        console.error('Error in Daily Challenge Cron:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
