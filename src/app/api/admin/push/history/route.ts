
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
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
        const history = await prisma.notificationHistory.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                sentBy: {
                    select: { name: true, email: true }
                }
            }
        })

        return NextResponse.json(history)
    } catch (error) {
        console.error('Error fetching notification history:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
