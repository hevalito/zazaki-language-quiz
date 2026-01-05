import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getBerlinStartOfDay } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const berlinToday = getBerlinStartOfDay(now)

        // Calculate Next Available (Tomorrow Berlin Midnight)
        const tomorrowBerlin = new Date(berlinToday)
        tomorrowBerlin.setDate(tomorrowBerlin.getDate() + 1)

        // Find today's daily quiz using Berlin Day Range
        // We look for any daily quiz where the date falls within "Today" in Berlin.
        // This is safer than exact timestamp matching.
        const dailyQuiz = await prisma.quiz.findFirst({
            where: {
                type: 'DAILY',
                date: {
                    gte: berlinToday,
                    lt: tomorrowBerlin
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

        const nextAvailable = tomorrowBerlin

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
