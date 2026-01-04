import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const now = new Date()
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
                questions: true
            }
        })

        if (!dailyQuiz) {
            return NextResponse.json({ error: 'No daily quiz found for today.' }, { status: 404 })
        }

        // Unlink questions (return to pool)
        const updated = await prisma.question.updateMany({
            where: { quizId: dailyQuiz.id },
            data: { quizId: null }
        })

        // Delete the quiz
        await prisma.quiz.delete({
            where: { id: dailyQuiz.id }
        })

        return NextResponse.json({
            success: true,
            message: `Reset complete. ${updated.count} questions returned to pool. Quiz deleted.`
        })

    } catch (error) {
        console.error('Reset Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
