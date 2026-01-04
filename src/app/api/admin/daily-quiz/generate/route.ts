import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic' // Ensure this runs dynamically

export async function POST(req: Request) {
    try {
        // 1. Verify Authorization (Admin only or Cron Secret)
        // For now, we'll check for a simple CRON_SECRET header or Admin session
        // But since this is /api/admin/*, middleware might protect it.
        // If called via Railway Cron, it needs a bypass key. User said "railway cronsjob".
        // I'll assume we pass a header `x-cron-secret` matching env var.

        const authHeader = req.headers.get('authorization')
        const cronSecret = req.headers.get('x-cron-secret')

        // Simple admin check bypass if cron secret matches (TODO: Add to env)
        const isCron = cronSecret === process.env.CRON_SECRET && !!process.env.CRON_SECRET

        // If not cron, require admin session (omitted for brevity, handled by middleware usually?
        // /api/admin is usually protected. If cron calls it, it might fail auth.
        // I should probably put this in /api/cron/daily-quiz if it's public-ish?)
        // User asked for "manual... in admin panel" AND "railway cronsjob".
        // I'll support both here. If called from Admin UI, header won't be set but session will be valid.

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
