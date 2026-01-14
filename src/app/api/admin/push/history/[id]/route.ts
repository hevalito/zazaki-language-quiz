
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    const session = await auth()

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
        const historyId = params.id

        const recipients = await prisma.notificationRecipient.findMany({
            where: { notificationHistoryId: historyId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        nickname: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { status: 'asc' }
        })

        return NextResponse.json(recipients)
    } catch (error) {
        console.error('Error fetching history details:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
