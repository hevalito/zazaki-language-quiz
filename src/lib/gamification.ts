import { prisma } from "@/lib/prisma"

export interface BadgeCheckResult {
    newBadges: any[] // Full Badge Objects
}

export async function checkBadges(userId: string): Promise<BadgeCheckResult> {
    const newBadges: any[] = []

    try {
        // 1. Fetch User Stats & All Badges
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                badges: true, // Already owned badges
                attempts: true, // Quiz history
            }
        })

        if (!user) return { newBadges }

        const allBadges = await prisma.badge.findMany({
            where: { isActive: true }
        })

        // 2. Identify unearned badges
        const earnedBadgeIds = new Set(user.badges.map(ub => ub.badgeId))
        const potentialBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id))

        // 3. Check Criteria for each unearned badge
        for (const badge of potentialBadges) {
            const criteria = badge.criteria as any
            let isEarned = false

            switch (criteria.type) {
                case 'streak':
                    if (user.streak >= (criteria.count || 0)) {
                        isEarned = true
                    }
                    break

                case 'total_xp':
                    if (user.totalXP >= (criteria.count || 0)) {
                        isEarned = true
                    }
                    break

                case 'level_reached':
                    // Map levels to numbers for comparison
                    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                    const currentLevelIndex = levels.indexOf(user.currentLevel)
                    const requiredLevelIndex = levels.indexOf(criteria.level)

                    if (currentLevelIndex >= 0 && requiredLevelIndex >= 0 && currentLevelIndex >= requiredLevelIndex) {
                        isEarned = true
                    }
                    break

                case 'total_quizzes':
                    // Check total number of COMPLETED attempts
                    // Learning Room sessions do NOT create attempts, so this is safe.
                    // But "Started" quizzes do create attempts that might be abandoned.
                    // We must check for completion.
                    const completedAttempts = user.attempts.filter(a => a.completedAt != null)

                    if (completedAttempts.length >= (criteria.count || 1)) {
                        isEarned = true
                    }
                    break

                case 'perfect_score_streak':
                    // Sort attempts by date descending (newest first)
                    const sortedAttempts = [...user.attempts].sort((a, b) =>
                        new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
                    )

                    let streak = 0
                    for (const attempt of sortedAttempts) {
                        // Check if perfect score (e.g. 100%)
                        if (attempt.maxScore > 0 && attempt.score >= attempt.maxScore) {
                            streak++
                        } else {
                            break // streak broken
                        }
                    }
                    if (streak >= (criteria.count || 3)) {
                        isEarned = true
                    }
                    break

                case 'lesson_completion':
                    if (criteria.count === 1 && user.attempts.length > 0) {
                        isEarned = true
                    }
                    break

                default:
                    break
            }

            // 4. Award Badge
            if (isEarned) {
                await prisma.userBadge.create({
                    data: {
                        userId: userId,
                        badgeId: badge.id
                    }
                })
                newBadges.push(badge) // Push full badge object
            }
        }

    } catch (error) {
        console.error("Error checking badges:", error)
    }

    return { newBadges }
}
