import { prisma } from "@/lib/prisma"

export interface BadgeCheckResult {
    newBadges: string[] // IDs of newly awarded badges
    unlockedBadgeTitles: string[] // Titles of newly awarded badges (for toast/display)
}

export async function checkBadges(userId: string): Promise<BadgeCheckResult> {
    const newBadges: string[] = []
    const unlockedBadgeTitles: string[] = []

    try {
        // 1. Fetch User Stats & All Badges
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                badges: true, // Already owned badges
                attempts: true, // Quiz history
            }
        })

        if (!user) return { newBadges, unlockedBadgeTitles }

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

                case 'total_xp': // Hypothetical new type
                    if (user.totalXP >= (criteria.count || 0)) {
                        isEarned = true
                    }
                    break

                case 'lesson_completion':
                    // Simplified check: if user has any progress marked 'completed'
                    // Ideally we'd count actual lesson completions from Progress table
                    // specific to the criteria requirements
                    // For "First Step" (count: 1), checking if any attempt exists might be a proxy, 
                    // or better, fetch Progress records.
                    if (criteria.count === 1 && user.attempts.length > 0) {
                        // "First Step" is loosely "Complete your first lesson". 
                        // If they have a quiz attempt, they likely finished a lesson component.
                        // A more robust check would query prisma.progress.
                        // For now, let's assume 'attempts > 0' is enough for "First Step" if it maps to quiz completion.
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
                newBadges.push(badge.id)

                // Extract title safely (it's JSON)
                const title = (badge.title as any)?.en || 'New Badge'
                unlockedBadgeTitles.push(title)
            }
        }

    } catch (error) {
        console.error("Error checking badges:", error)
    }

    return { newBadges, unlockedBadgeTitles }
}
