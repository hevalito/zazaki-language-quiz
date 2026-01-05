import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import webPush from 'web-push'

export async function POST(req: NextRequest) {
    const session = await auth()

    // Check for admin permissions
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user?.isAdmin) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    try {
        const { title, body, url } = await req.json()

        if (!title || !body) {
            return new NextResponse('Title and body required', { status: 400 })
        }

        // Setup Web Push
        if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
            return new NextResponse('VAPID keys not configured', { status: 500 })
        }

        webPush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@zazaki.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        )

        // Fetch all subscriptions
        const subscriptions = await prisma.pushSubscription.findMany()

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No subscriptions found' })
        }

        const payload = JSON.stringify({
            title,
            body,
            url: url || '/',
            actions: [
                { action: 'open', title: 'Öffnen' }
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
                        return prisma.pushSubscription.delete({ where: { id: sub.id } })
                    }
                    console.error(`Failed to send push to ${sub.id}:`, err)
                })
        )

        await Promise.all(promises)

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount,
            removed: removedCount
        })

    } catch (error) {
        console.error('Error broadcasting push:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
