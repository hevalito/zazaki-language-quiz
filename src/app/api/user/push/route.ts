import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const subscription = await req.json()

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return new NextResponse('Invalid subscription', { status: 400 })
        }

        // Check if subscription already exists for this endpoint to avoid duplicates
        const existing = await prisma.pushSubscription.findFirst({
            where: {
                endpoint: subscription.endpoint,
                userId: session.user.id
            }
        })

        if (!existing) {
            await prisma.pushSubscription.create({
                data: {
                    userId: session.user.id,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                }
            })
        } else {
            // Update keys if they changed (unlikely for same endpoint but possible)
            if (existing.p256dh !== subscription.keys.p256dh || existing.auth !== subscription.keys.auth) {
                await prisma.pushSubscription.update({
                    where: { id: existing.id },
                    data: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving push subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const { endpoint } = await req.json()

        if (!endpoint) {
            return new NextResponse('Endpoint required', { status: 400 })
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                userId: session.user.id,
                endpoint: endpoint
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting push subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
