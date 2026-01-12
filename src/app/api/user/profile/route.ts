import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateUserStreak } from '@/lib/streak-calc'
import { checkBadges } from '@/lib/gamification'
import { logActivity } from '@/lib/activity'
import { ActivityType } from '@prisma/client'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Auto-Heal Streak Logic
        // Calculate strict streak from history
        const { streak: calculatedStreak, lastActiveDate } = await calculateUserStreak(session.user.id)

        let user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                nickname: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                dailyGoal: true,
                preferredScript: true,
                hasSeenTour: true,
                streak: true, // Needed for comparison
                courseFinderData: true, // Include Course Finder Data
                notifyDaily: true,
                notifyFeatures: true,
                notifyWeekly: true,
                totalXP: true,
                totalXP: true,
                currentLevel: true,
                theme: true
            }
        })

        if (user && user.streak !== calculatedStreak) {
            // Heal the record
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    streak: calculatedStreak,
                    // Only update lastActiveDate if we found one and it's missing/different?
                    // safer to just update streak. 
                    // Actually, let's update lastActiveDate too if valid.
                    ...(lastActiveDate ? { lastActiveDate } : {})
                }
            })
            // Update local object to return correct data
            user.streak = calculatedStreak
        }

        // Retroactive Badge Check
        // This ensures existing users get badges for things they already did (like profile setup)
        const badgeResult = await checkBadges(session.user.id)

        // Return user AND new badges if any
        return NextResponse.json({
            ...user,
            newBadges: badgeResult.newBadges
        })
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ...
// ... existing imports

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { nickname, firstName, lastName, dailyGoal, preferredScript, notifyDaily, notifyFeatures, notifyWeekly, theme } = body

        // Validate inputs if necessary

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                nickname,
                firstName,
                lastName,
                dailyGoal: dailyGoal ? parseInt(dailyGoal) : undefined,
                preferredScript,
                ...(notifyDaily !== undefined && { notifyDaily }),
                ...(notifyFeatures !== undefined && { notifyFeatures }),
                ...(notifyWeekly !== undefined && { notifyWeekly }),
                ...(theme !== undefined && { theme })
            }
        })

        // Log Activity for extended auditing
        await logActivity(session.user.id, ActivityType.PROFILE_UPDATED, {
            fields: Object.keys(body).filter(k => body[k] !== undefined)
        })

        // Check for "Profile Completed" achievements
        const badgeResult = await checkBadges(session.user.id)

        // Return user AND new badges if any
        return NextResponse.json({
            ...updatedUser,
            newBadges: badgeResult.newBadges
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
