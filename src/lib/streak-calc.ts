import { prisma } from "@/lib/prisma"
import { getBerlinDateString } from "@/lib/date-utils"

/**
 * Calculates a user's current streak based on their attempt history.
 * Standardized on Berlin Time.
 */
export async function calculateUserStreak(userId: string): Promise<{ streak: number, lastActiveDate: Date | null }> {
    // 1. Fetch all completed attempts with their dates
    const attempts = await prisma.attempt.findMany({
        where: {
            userId: userId,
            completedAt: { not: null }
        },
        select: {
            completedAt: true
        },
        orderBy: {
            completedAt: 'desc'
        }
    })

    if (attempts.length === 0) {
        return { streak: 0, lastActiveDate: null }
    }

    // 2. Convert to unique Set of "Berlin Days" (YYYY-MM-DD)
    const activeDays = new Set<string>()
    for (const attempt of attempts) {
        if (attempt.completedAt) {
            activeDays.add(getBerlinDateString(attempt.completedAt))
        }
    }

    // 3. Sort unique days descending
    const sortedDays = Array.from(activeDays).sort().reverse() // YYYY-MM-DD strings sort correctly

    if (sortedDays.length === 0) {
        return { streak: 0, lastActiveDate: null }
    }

    // 4. Check consecutiveness
    const todayStr = getBerlinDateString(new Date())

    // Determine start point
    // If user was active Today, streak includes Today.
    // If user was NOT active Today but WAS active Yesterday, streak is strictly alive but "waiting".
    // If neither, streak is 0.

    let streak = 0
    let currentCheckDate = new Date() // Start checking from "Today"
    let currentCheckStr = getBerlinDateString(currentCheckDate)

    // Optimization: Does the list contain Today?
    if (activeDays.has(currentCheckStr)) {
        streak = 1
        // Move check to yesterday
        currentCheckDate.setDate(currentCheckDate.getDate() - 1)
        currentCheckStr = getBerlinDateString(currentCheckDate)
    } else {
        // Did not play today. Did they play yesterday?
        // Check Yesterday
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = getBerlinDateString(yesterday)

        if (activeDays.has(yesterdayStr)) {
            streak = 1 // Streak is kept alive by yesterday
            // Move check to day before yesterday
            currentCheckDate = yesterday
            currentCheckDate.setDate(currentCheckDate.getDate() - 1)
            currentCheckStr = getBerlinDateString(currentCheckDate)
        } else {
            // Not active today OR yesterday -> Streak broken
            return {
                streak: 0,
                lastActiveDate: attempts[0].completedAt // Return last actual activity date for record
            }
        }
    }

    // Now iterate backwards counting consecutive days
    while (true) {
        if (activeDays.has(currentCheckStr)) {
            streak++
            // Move back one day
            currentCheckDate.setDate(currentCheckDate.getDate() - 1)
            currentCheckStr = getBerlinDateString(currentCheckDate)
        } else {
            break // Gap found
        }
    }

    return {
        streak,
        lastActiveDate: attempts[0].completedAt // Most recent completion
    }
}
