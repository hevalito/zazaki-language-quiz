import { isSameBerlinDay } from "./date-utils"

// ... existing imports
import { ActivityType } from "@prisma/client"

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
                attempts: {
                    include: { quiz: true }
                }, // Quiz history with Quiz details for Daily check
                activities: true, // Activity history for things like learning sessions
            }
        })

        if (!user) return { newBadges }

        const allBadges = await prisma.badge.findMany({
            where: { isActive: true }
        })

        // 2. Identify unearned badges
        const earnedBadgeIds = new Set(user.badges.map((ub: { badgeId: string }) => ub.badgeId))
        const potentialBadges = allBadges.filter((b: { id: string }) => !earnedBadgeIds.has(b.id))

        // 3. Check Criteria for each unearned badge
        for (const badge of potentialBadges) {
            const criteria = badge.criteria as any
            let isEarned = false

            switch (criteria.type) {
                // ... existing cases ...
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
                    // Strict Rule: Daily Quizzes only count if completed ON the day they were created (Berlin Time)
                    const validAttempts = user.attempts.filter((a: any) => {
                        if (!a.completedAt) return false

                        // If it's a Daily Quiz, check the date
                        if (a.quiz?.type === 'DAILY' && a.quiz?.date) {
                            return isSameBerlinDay(new Date(a.completedAt), new Date(a.quiz.date))
                        }

                        return true
                    })

                    if (validAttempts.length >= (criteria.count || 1)) {
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

                // --- NEW ACHIEVEMENT TYPES ---

                case 'profile_filled':
                    // Check if specific fields are populated
                    let fieldsToCheck = criteria.fields || ['avatarUrl']

                    // Defensive: Ensure array
                    if (!Array.isArray(fieldsToCheck)) {
                        // Attempt to rescue single value
                        fieldsToCheck = [fieldsToCheck]
                    }

                    const allFieldsDriven = fieldsToCheck.every((field: string) => {
                        // Special handling for avatarUrl vs image (NextAuth default)
                        if (field === 'avatarUrl') {
                            return (user.image && user.image.length > 0) || (user.avatarUrl && user.avatarUrl.length > 0)
                        }

                        // Robust check for values (allow 0, deny null/undefined/empty string)
                        const val = (user as any)[field]
                        return val !== null && val !== undefined && val.toString().trim().length > 0
                    })

                    if (allFieldsDriven) {
                        isEarned = true
                    }
                    break

                case 'learning_sessions':
                    // Count completed learning sessions
                    const learningSessions = user.activities.filter((a: { type: ActivityType, status: string }) =>
                        a.type === ActivityType.LEARNING_PRACTICE &&
                        a.status === 'COMPLETED'
                    )
                    if (learningSessions.length >= (criteria.count || 1)) {
                        isEarned = true
                    }
                    break

                case 'speed_demon':
                    // Check if ANY attempt meets the speed criteria
                    // criteria.maxSeconds: max time in seconds
                    // criteria.minScore: optional, minimum score percentage (0-100) default 100
                    const maxSeconds = criteria.maxSeconds || 30
                    const minScorePercent = criteria.minScore || 100

                    const fastAttempt = user.attempts.some((a: any) => {
                        if (!a.completedAt) return false
                        const timeInSeconds = a.timeSpent || 0
                        const scorePercent = (a.score / a.maxScore) * 100
                        return timeInSeconds <= maxSeconds && scorePercent >= minScorePercent
                    })

                    if (fastAttempt) {
                        isEarned = true
                    }
                    break

                case 'time_of_day':
                    // Check if ANY attempt was completed within the time window
                    // criteria.startHour: 0-23
                    // criteria.endHour: 0-23
                    const startHour = criteria.startHour ?? 5 // Default 5 AM
                    const endHour = criteria.endHour ?? 9     // Default 9 AM

                    const timedAttempt = user.attempts.some((a: { completedAt: Date | null }) => {
                        if (!a.completedAt) return false
                        const date = new Date(a.completedAt)
                        const hour = date.getHours()
                        // Handle crossing midnight e.g. 23 to 02
                        if (startHour <= endHour) {
                            return hour >= startHour && hour < endHour
                        } else {
                            // Night owl case: 22 to 04
                            return hour >= startHour || hour < endHour
                        }
                    })

                    if (timedAttempt) {
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
