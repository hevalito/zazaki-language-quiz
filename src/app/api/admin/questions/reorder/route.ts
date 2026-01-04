import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { items } = await request.json()

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items array' }, { status: 400 })
        }

        // Use transaction to update all items safely
        await prisma.$transaction(
            items.map((item: { id: string; order: number }) =>
                prisma.question.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering questions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
