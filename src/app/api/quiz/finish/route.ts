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

        // Check ownership
        const activity = await prisma.activity.findUnique({
            where: { id: activityId }
        })

        if (!activity || activity.userId !== session.user.id) {
            return NextResponse.json({ error: 'Activity not found or unauthorized' }, { status: 404 })
        }

        // If it's already completed, do nothing
        if (activity.status === 'COMPLETED' || activity.status === 'FAILED') {
            return NextResponse.json({ success: true })
        }

        // Close it
        await prisma.activity.update({
            where: { id: activityId },
            data: {
                status: 'COMPLETED', // Mark as completed (session ended)
                updatedAt: new Date(),
                metadata: {
                    ...(activity.metadata as object),
                    abandoned: true // Mark as abandoned in metadata
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error finishing quiz session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
