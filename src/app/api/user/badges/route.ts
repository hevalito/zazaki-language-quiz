import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch available badges
        const allBadges = await prisma.badge.findMany({
            where: { isActive: true }
        })

        // 2. Fetch earned badges
        const userBadges = await prisma.userBadge.findMany({
            where: { userId: session.user.id }
        })

        const earnedBadgeMap = new Map()
        userBadges.forEach(ub => {
            earnedBadgeMap.set(ub.badgeId, ub)
        })

        // 3. Merge data
        const badges = allBadges.map(badge => ({
            ...badge,
            isEarned: earnedBadgeMap.has(badge.id),
            earnedAt: earnedBadgeMap.get(badge.id)?.earnedAt
        }))

        return NextResponse.json(badges)

    } catch (error) {
        console.error("Error fetching badges:", error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
