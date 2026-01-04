import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic' // Ensure this runs dynamically

import { requireAdmin } from '@/lib/admin-auth'

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization')
        const cronSecret = req.headers.get('x-cron-secret')

        const isCron = cronSecret === process.env.CRON_SECRET && !!process.env.CRON_SECRET

        if (!isCron) {
            const isAdmin = await requireAdmin()
            if (!isAdmin) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        // 2. Check if quiz already exists for today
        const now = new Date()
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)

        const existingQuiz = await prisma.quiz.findFirst({
            where: {
                type: 'DAILY',
                date: {
                    gte: todayStart,
                    lte: todayEnd
                }
            }
        })

        if (existingQuiz) {
            return NextResponse.json({
                message: 'Daily quiz for today already exists.',
                quizId: existingQuiz.id
            }, { status: 200 })
        }

        // 3. Fetch 5 Random Pool Questions
        // Prisma doesn't support RANDOM(), so we fetch IDs of pool questions and pick 5.
        const poolCount = await prisma.question.count({
            where: { quizId: null }
        })

        if (poolCount < 5) {
            return NextResponse.json({
                error: 'Not enough questions in the pool.',
                poolCount
            }, { status: 400 })
        }

        // Heuristic: If pool is huge, don't fetch all IDs. But assume pool < 10k for now.
        const poolQuestions = await prisma.question.findMany({
            where: { quizId: null },
            select: { id: true }
        })

        // Shuffle and pick 5
        const shuffled = poolQuestions.sort(() => 0.5 - Math.random())
        const selectedIds = shuffled.slice(0, 5).map(q => q.id)

        // 4. Create Quiz
        // We need language titles. standard: "Daily Quiz YYYY-MM-DD"
        const dateStr = now.toISOString().split('T')[0]
        const title = {
            en: `Daily Quiz ${dateStr}`,
            de: `Tagesquiz ${dateStr}`
        }

        const quiz = await prisma.quiz.create({
            data: {
                type: 'DAILY',
                date: now,
                title,
                isPublished: true,
                config: { timeLimit: 300 }, // Default 5 mins?
                // Order? 0 is fine.
            }
        })

        // 5. Update Questions
        await prisma.question.updateMany({
            where: { id: { in: selectedIds } },
            data: { quizId: quiz.id }
        })

        return NextResponse.json({
            success: true,
            quizId: quiz.id,
            questionCount: selectedIds.length
        })

    } catch (error) {
        console.error('Daily Quiz Gen Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
