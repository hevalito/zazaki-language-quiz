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
            where: { isActive: true },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        // 2. Fetch earned badges
        const userBadges = await prisma.userBadge.findMany({
            where: { userId: session.user.id }
        })

        const earnedBadgeMap = new Map()
        userBadges.forEach(ub => {
            earnedBadgeMap.set(ub.badgeId, ub)
        })

        // 3. Fetch full user stats for progress calc
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { totalXP: true, streak: true, currentLevel: true }
        })

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // 4. Merge data and calculate progress
        const badges = allBadges.map(badge => {
            const userBadge = earnedBadgeMap.get(badge.id)
            const isEarned = !!userBadge
            const criteria = badge.criteria as any

            let current = 0
            let target = 0
            let displayProgress = ''

            if (isEarned) {
                current = 100
                target = 100
            } else if (criteria) {
                switch (criteria.type) {
                    case 'total_xp':
                        target = criteria.count || 0
                        current = Math.min(user.totalXP, target)
                        displayProgress = `${current} / ${target} XP`
                        break
                    case 'streak':
                        target = criteria.count || 0
                        current = user.streak
                        displayProgress = `${current} / ${target} Days`
                        break
                    case 'level_reached':
                        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                        const targetIdx = levels.indexOf(criteria.level)
                        const currentIdx = levels.indexOf(user.currentLevel)
                        // Simple progress: 0 if below, 1 if met (but checking indices helps show closeness)
                        target = targetIdx
                        current = Math.min(currentIdx, targetIdx)
                        // To avoid 0/0 issues or complex mapping, let's just show text
                        displayProgress = `${user.currentLevel} / ${criteria.level}`
                        break
                    default:
                        // Default to 0 progress for untracked types
                        target = criteria.count || 1
                        current = 0
                }
            }

            return {
                ...badge,
                isEarned,
                earnedAt: userBadge?.earnedAt,
                progress: { current, target, display: displayProgress }
            }
        })

        return NextResponse.json(badges)

    } catch (error) {
        console.error("Error fetching badges:", error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
