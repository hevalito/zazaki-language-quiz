import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCronSecret, sendPushBatch, shouldRunCron, getNotificationTemplate, replaceVariables } from '@/lib/cron'
import { startOfDay } from 'date-fns'

export async function POST(req: NextRequest) {
    if (!validateCronSecret(req)) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!await shouldRunCron('streak_saver')) {
        return NextResponse.json({ skipped: true, reason: 'Disabled in settings' })
    }

    try {
        const template = await getNotificationTemplate(
            'streak_saver',
            'Achtung! Dein {streak}-Tage Streak ist in Gefahr! 😱'
        )

        // Find users who have a streak but haven't played today
        const todayStart = startOfDay(new Date())

        const atRiskUsers = await prisma.user.findMany({
            where: {
                notifyDaily: true,
                streak: { gt: 0 },
                OR: [
                    { lastActiveDate: { lt: todayStart } },
                    { lastActiveDate: null } // Should technically not happen if streak > 0, but good safety
                ],
                pushSubscriptions: { some: {} } // Optimization: Only fetch if they have subscriptions
            },
            include: {
                pushSubscriptions: true
            }
        })

        if (atRiskUsers.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No at-risk users found' })
        }

        let successCount = 0
        let failureCount = 0

        const promises = atRiskUsers.map(async (user) => {
            const name = user.nickname || user.name || 'Champion'
            const msg = replaceVariables(template, {
                username: name,
                streak: user.streak
            })

            const result = await sendPushBatch({
                subscriptions: user.pushSubscriptions,
                title: 'Streak Saver',
                body: msg,
                url: '/quiz/daily',
                type: 'STREAK_SAVER',
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
        console.error('Error in Streak Saver Cron:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
