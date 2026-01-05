import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await prisma.user.update({
            where: { id: session.user.id },
            data: { hasSeenTour: true }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
