
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { ids, action, targetId } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
        }

        if (action === 'assign') {
            if (!targetId) {
                return NextResponse.json({ error: 'Target ID required for assign' }, { status: 400 })
            }
            // Get current max order
            const lastQ = await prisma.question.findFirst({
                where: { quizId: targetId },
                orderBy: { order: 'desc' }
            })
            const startOrder = (lastQ?.order || 0) + 1

            // Assign one by one to set order (or bulk update with same order? no, need increment)
            // Or just bulk update and let reorder fix it? Standard says order field exists.
            // If we bulk update without order, they clash.
            // Prisma doesn't support bulk update with computed values easily.
            // We'll iterate.

            await prisma.$transaction(
                ids.map((id, index) =>
                    prisma.question.update({
                        where: { id },
                        data: {
                            quizId: targetId,
                            order: startOrder + index
                        }
                    })
                )
            )

        } else if (action === 'unassign') {
            await prisma.question.updateMany({
                where: { id: { in: ids } },
                data: { quizId: null, order: 0 }
            })
        } else if (action === 'delete') {
            await prisma.question.deleteMany({
                where: { id: { in: ids } }
            })
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Bulk action error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
