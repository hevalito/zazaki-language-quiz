
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch all users
        const users = await prisma.user.findMany({
            select: { id: true, totalXP: true }
        })

        const updates = []

        for (const user of users) {
            // 2. Aggregate XP from Attempts
            const aggregate = await prisma.attempt.aggregate({
                where: {
                    userId: user.id,
                    completedAt: { not: null }
                },
                _sum: {
                    xpEarned: true
                }
            })

            const realTotalXP = aggregate._sum.xpEarned || 0

            // 3. Compare and Update if needed
            if (realTotalXP !== user.totalXP) {
                updates.push(
                    prisma.user.update({
                        where: { id: user.id },
                        data: { totalXP: realTotalXP }
                    })
                )
            }
        }

        // Execute batch updates
        if (updates.length > 0) {
            await prisma.$transaction(updates)
        }

        return NextResponse.json({
            message: 'XP Recalculation Complete',
            usersChecked: users.length,
            discrepanciesFixed: updates.length
        })

    } catch (error) {
        console.error('Error recalculating XP:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
