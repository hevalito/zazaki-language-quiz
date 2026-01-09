
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { activityId } = body

        if (!activityId) {
            return NextResponse.json({ error: 'activityId is required' }, { status: 400 })
        }

        // Verify and update activity
        const activity = await prisma.activity.findUnique({
            where: { id: activityId }
        })

        if (!activity) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
        }

        if (activity.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        if (activity.status !== 'IN_PROGRESS') {
            return NextResponse.json({ error: 'Session is no longer active', status: activity.status }, { status: 410 }) // 410 Gone
        }

        // Update heartbeat
        await prisma.activity.update({
            where: { id: activityId },
            data: {
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Heartbeat error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
