import { PrismaClient, ActivityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Backfilling activity data from history...')

    // 1. Backfill Quiz Attempts
    const attempts = await prisma.attempt.findMany({
        where: {
            completedAt: { not: null }
        },
        include: {
            quiz: true
        }
    })

    console.log(`Found ${attempts.length} completed attempts.`)

    for (const attempt of attempts) {
        if (!attempt.completedAt) continue

        // Check if activity already exists (rudimentary check)
        // In a real scenario, we might want a composite unique key or check existence more robustly
        // For now, we trust this is a one-off.

        // Try to find existing activity to avoid duplicates if run multiple times
        // This is expensive but safer.
        const exists = await prisma.activity.findFirst({
            where: {
                userId: attempt.userId,
                type: 'QUIZ_COMPLETED',
                createdAt: attempt.completedAt,
                // checking metadata logic via JSON filter is hard in Prisma, so relying on timestamp + user
                // roughly unique enough for this backfill
            }
        })

        if (!exists) {
            await prisma.activity.create({
                data: {
                    userId: attempt.userId,
                    type: 'QUIZ_COMPLETED',
                    metadata: {
                        quizId: attempt.quizId,
                        quizTitle: attempt.quiz.title, // Can be object or string, handled by ActivityFeed
                        score: attempt.score,
                        maxScore: attempt.maxScore,
                        xpEarned: attempt.xpEarned,
                        percentage: attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0
                    },
                    createdAt: attempt.completedAt
                }
            })
        }
    }

    // 2. Backfill Badges
    const userBadges = await prisma.userBadge.findMany({
        include: {
            badge: true
        }
    })

    console.log(`Found ${userBadges.length} earned badges.`)

    for (const ub of userBadges) {
        const exists = await prisma.activity.findFirst({
            where: {
                userId: ub.userId,
                type: 'BADGE_EARNED',
                createdAt: ub.earnedAt
            }
        })

        if (!exists) {
            await prisma.activity.create({
                data: {
                    userId: ub.userId,
                    type: 'BADGE_EARNED',
                    metadata: {
                        badgeId: ub.badgeId,
                        badgeTitle: ub.badge.title, // Can be object or string
                        badgeIcon: ub.badge.iconUrl
                    },
                    createdAt: ub.earnedAt
                }
            })
        }
    }

    console.log('✅ Backfill complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
