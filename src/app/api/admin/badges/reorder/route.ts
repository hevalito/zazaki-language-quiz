import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { items } = await request.json()

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            )
        }

        // Use transaction to ensure all updates succeed or fail together
        await prisma.$transaction(
            items.map((item: any, index: number) =>
                prisma.badge.update({
                    where: { id: item.id },
                    data: { sortOrder: index }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering badges:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
