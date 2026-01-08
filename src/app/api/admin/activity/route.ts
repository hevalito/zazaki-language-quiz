import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify Admin via DB
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!currentUser?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const userId = searchParams.get('userId')
        const skip = (page - 1) * limit

        const where = userId ? { userId } : {}

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            nickname: true,
                            email: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.activity.count({ where })
        ])

        return NextResponse.json({
            activities,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching activity feed:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
