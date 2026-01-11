import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await auth()
        const isAdmin = session?.user?.email === 'heval@me.com' || (session?.user as any)?.isAdmin

        if (!isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const openFeedbackCount = await prisma.feedback.count({
            where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
        })

        return NextResponse.json({
            openFeedbackCount
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
