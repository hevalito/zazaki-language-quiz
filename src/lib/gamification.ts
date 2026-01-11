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
            try {
                // DEFENSIVE: Check for null/malformed criteria
                if (!badge.criteria || typeof badge.criteria !== 'object') {
                    console.warn(`Skipping badge ${badge.id} (${badge.code}): Invalid criteria`, badge.criteria)
                    continue
                }

                const criteria = badge.criteria as any
                let isEarned = false

                // DEFENSIVE: Ensure type exists
                if (!criteria.type) {
                    continue
                }

                switch (criteria.type) {
                    case 'streak':
                        // Ensure count is valid number > 0 to prevent instant unlock on bad data
                        const streakTarget = Number(criteria.count)
                        if (streakTarget > 0 && user.streak >= streakTarget) {
                            isEarned = true
                        }
                        break

                    case 'total_xp':
                        const xpTarget = Number(criteria.count)
                        if (xpTarget > 0 && user.totalXP >= xpTarget) {
                            isEarned = true
                        }
                        break

                    case 'level_reached':
                        if (!criteria.level) break

                        // Map levels to numbers for comparison
                        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                        const currentLevelIndex = levels.indexOf(user.currentLevel)
                        const requiredLevelIndex = levels.indexOf(criteria.level)

                        if (currentLevelIndex >= 0 && requiredLevelIndex >= 0 && currentLevelIndex >= requiredLevelIndex) {
                            isEarned = true
                        }
                        break

                    case 'total_quizzes':
                        const quizTarget = Number(criteria.count)
                        if (quizTarget <= 0) break

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

                        if (validAttempts.length >= quizTarget) {
                            isEarned = true
                        }
                        break

                    case 'perfect_score_streak':
                        const perfectTarget = Number(criteria.count) || 3
                        if (perfectTarget <= 0) break

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
                        if (streak >= perfectTarget) {
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

                        const allFieldsDriven = fieldsToCheck.every((rawField: string) => {
                            // Normalize snake_case to camelCase to match Prisma model
                            const fieldMap: Record<string, string> = {
                                'first_name': 'firstName',
                                'last_name': 'lastName',
                                'daily_goal': 'dailyGoal',
                                'avatar_url': 'avatarUrl',
                                'preferred_script': 'preferredScript',
                                'current_level': 'currentLevel'
                            }

                            const field = fieldMap[rawField] || rawField

                            // Special handling for avatarUrl vs image (NextAuth default)
                            if (field === 'avatarUrl' || field === 'image') {
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
                        const sessionTarget = Number(criteria.count) || 1
                        // Count completed learning sessions
                        const learningSessions = user.activities.filter((a: { type: ActivityType, status: string }) =>
                            a.type === ActivityType.LEARNING_PRACTICE &&
                            a.status === 'COMPLETED'
                        )
                        if (learningSessions.length >= sessionTarget) {
                            isEarned = true
                        }
                        break

                    case 'speed_demon':
                        // Check if ANY attempt meets the speed criteria
                        // criteria.maxSeconds: max time in seconds
                        // criteria.minScore: optional, minimum score percentage (0-100) default 100
                        const maxSeconds = Number(criteria.maxSeconds) || 30
                        const minScorePercent = Number(criteria.minScore) || 100

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
            } catch (innerError) {
                console.error(`Error processing badge ${badge.id} (${badge.code}):`, innerError)
                // Continue to next badge
            }
        }

    } catch (error) {
        console.error("Error checking badges:", error)
    }

    return { newBadges }
}
