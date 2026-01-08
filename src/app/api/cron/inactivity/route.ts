import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCronSecret, sendPushBatch, shouldRunCron, getNotificationTemplate, replaceVariables } from '@/lib/cron'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function POST(req: NextRequest) {
    if (!validateCronSecret(req)) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!await shouldRunCron('inactivity')) {
        return NextResponse.json({ skipped: true, reason: 'Disabled in settings' })
    }

    try {
        const template = await getNotificationTemplate(
            'inactivity',
            'Wir vermissen dich! Komm zurück und lerne weiter. 👋'
        )

        // Window: Inactive between 3 and 4 days ago
        // If today is Friday:
        // 3 days ago = Tuesday
        // 4 days ago = Monday
        // We want users whose lastActiveDate was on Monday (so they have been gone Tue, Wed, Thu -> 3 full days)
        // Adjusting logic:
        // < 3 days ago is basically "older than 3 days ago"
        // > 4 days ago is basically "younger than 4 days ago"

        const now = new Date()
        const threeDaysAgo = subDays(now, 3)
        const fourDaysAgo = subDays(now, 4)

        const inactiveUsers = await prisma.user.findMany({
            where: {
                notifyWeekly: true, // Assuming this covers general engagement
                lastActiveDate: {
                    lt: threeDaysAgo,
                    gt: fourDaysAgo
                },
                pushSubscriptions: { some: {} }
            },
            include: {
                pushSubscriptions: true
            }
        })

        if (inactiveUsers.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No inactive users found in window' })
        }

        let successCount = 0
        let failureCount = 0

        const promises = inactiveUsers.map(async (user) => {
            const name = user.nickname || user.name || 'Champion'
            // Calculate actual inactive days (approx)
            const daysInactive = user.lastActiveDate
                ? Math.floor((now.getTime() - user.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
                : 3

            const msg = replaceVariables(template, {
                username: name,
                days_inactive: daysInactive
            })

            const result = await sendPushBatch({
                subscriptions: user.pushSubscriptions,
                title: 'Zazaki Quiz',
                body: msg,
                url: '/',
                type: 'INACTIVITY_RESCUE',
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
        console.error('Error in Inactivity Cron:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
