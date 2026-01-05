import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'
import { getBerlinStartOfDay } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        // Define "Today" based on server time (UTC usually in Railway, but user wants 06:00 CET logic).
        // For simplicity now, we match the Admin "Generate" logic which uses `startOfDay` locally.
        // We should just find the DAILY quiz where `date` matches "today" (ignoring time components if we stored date-only, but Prisma stores DateTime).

        // Find today's daily quiz
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)

        const dailyQuiz = await prisma.quiz.findFirst({
            where: {
                type: 'DAILY',
                date: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        })

        // Check completion status
        let completed = false
        if (dailyQuiz) {
            const attempt = await prisma.attempt.findFirst({
                where: {
                    quizId: dailyQuiz.id,
                    userId: session.user.id,
                    completedAt: { not: null }
                }
            })
            if (attempt) completed = true
        }

        // Calculate Next Available Time
        // 06:00 CET tomorrow.
        // Simple logic: Next 06:00 local time.
        // Wait, "generate at 06:00 CET".
        // Use date-fns to set time to 06:00 next day.
        let nextAvailable = setHours(setMinutes(setSeconds(setMilliseconds(addDays(now, 1), 0), 0), 0), 6)
        // If it's currently before 06:00 AND no quiz exists for "today" (meaning today IS the next cycle relative to last night), 
        // actually generation happens at 06:00.
        // If it's 01:00 AM, the "daily quiz" for "today" (06:00 start) hasn't happened.
        // This date logic is tricky.
        // Admin generation runs at 06:00.
        // So for 00:00-05:59, we are waiting for TODAY'S quiz.
        // For 06:00-23:59, we have TODAY'S quiz (or waiting for tomorrow).

        // Refined Logic:
        // If dailyQuiz exists for "today" (Standard Date object matches YYYY-MM-DD), then we have it.
        // If not, and it's before 06:00, next is Today 06:00.
        // If not, and it's after 06:00, next is Tomorrow 06:00.

        // Since we query by `startOfDay`..`endOfDay`, we find if a quiz exists with today's date.
        // The generator sets `date` to `new Date()` when it runs.

        if (!dailyQuiz) {
            const sixAmToday = setHours(setMinutes(setSeconds(setMilliseconds(now, 0), 0), 0), 6)
            if (now < sixAmToday) {
                nextAvailable = sixAmToday
            } else {
                nextAvailable = setHours(setMinutes(setSeconds(setMilliseconds(addDays(now, 1), 0), 0), 0), 6)
            }
        }

        return NextResponse.json({
            available: !!dailyQuiz,
            completed,
            quiz: dailyQuiz ? {
                id: dailyQuiz.id,
                date: dailyQuiz.date, // Prisma Date object
                questionCount: dailyQuiz._count.questions
            } : null,
            nextAvailableAt: nextAvailable.toISOString()
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
