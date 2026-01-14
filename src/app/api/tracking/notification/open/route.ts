import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { notificationId } = body

        if (!notificationId) {
            return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 })
        }

        await prisma.notificationRecipient.update({
            where: { id: notificationId },
            data: {
                status: 'OPENED',
                openedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error tracking notification open:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
