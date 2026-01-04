import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        // Delete all badges for the target user
        await prisma.userBadge.deleteMany({
            where: { userId: id }
        })

        return NextResponse.json({ success: true, message: 'User badges reset successfully' })
    } catch (error) {
        console.error('Error resetting user badges:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
