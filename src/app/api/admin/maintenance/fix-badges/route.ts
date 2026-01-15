import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { isSameBerlinDay } from '@/lib/date-utils' // reuse existing utility

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Identify "Total Quizzes" Badges
        const allBadges = await prisma.badge.findMany({
            where: { isActive: true }
        })

        const quizBadges = allBadges.filter(b => {
            const c = b.criteria as any
            return c && c.type === 'total_quizzes'
        })

        if (quizBadges.length === 0) {
            return NextResponse.json({ message: 'No total_quizzes badges found' })
        }

        const quizBadgeIds = quizBadges.map(b => b.id)

        // 2. Find Users who have any of these badges
        const usersToCheck = await prisma.user.findMany({
            where: {
                badges: {
                    some: {
                        badgeId: { in: quizBadgeIds }
                    }
                }
            },
            include: {
                badges: {
                    include: { badge: true }
                },
                attempts: {
                    include: { quiz: true }
                }
            }
        })

        const dryRun = false // Set to true to verify first if preferred, but user asked to rollback.
        const removed: any[] = []

        for (const user of usersToCheck) {
            // Calculate REAL unique count
            const validAttempts = user.attempts.filter((a: any) => {
                if (!a.completedAt) return false
                if (a.quiz?.type === 'DAILY' && a.quiz?.date) {
                    return isSameBerlinDay(new Date(a.completedAt), new Date(a.quiz.date))
                }
                return true
            })

            const uniqueQuizIds = new Set(validAttempts.map((a: any) => a.quizId))
            const realCount = uniqueQuizIds.size

            // Check each owned quiz badge
            for (const userBadge of user.badges) {
                const criteria = userBadge.badge.criteria as any
                if (criteria.type !== 'total_quizzes') continue

                const target = Number(criteria.count) || 0

                if (realCount < target) {
                    // Badge is INVALID
                    removed.push({
                        user: user.email || user.id,
                        badge: userBadge.badge.code,
                        badgeId: userBadge.badge.id,
                        realCount,
                        target,
                        userBadgeId: userBadge.id
                    })

                    if (!dryRun) {
                        await prisma.userBadge.delete({
                            where: { id: userBadge.id }
                        })
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            removedCount: removed.length,
            removedDetails: removed
        })

    } catch (error) {
        console.error('Error fixing badges:', error)
        return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
    }
}
