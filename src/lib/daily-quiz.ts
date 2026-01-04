
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function generateDailyQuiz() {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    // Check if quiz already exists
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
        return { success: false, message: 'Daily quiz for today already exists.', quizId: existingQuiz.id }
    }

    // Fetch pool questions
    const poolCount = await prisma.question.count({
        where: { quizId: null }
    })

    if (poolCount < 5) {
        return { success: false, message: 'Not enough questions in the pool.', poolCount }
    }

    const poolQuestions = await prisma.question.findMany({
        where: { quizId: null },
        select: { id: true }
    })

    // Shuffle and pick 5
    const shuffled = poolQuestions.sort(() => 0.5 - Math.random())
    const selectedIds = shuffled.slice(0, 5).map(q => q.id)

    // Create Quiz
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
            config: { timeLimit: 300 },
        }
    })

    // Update Questions
    await prisma.question.updateMany({
        where: { id: { in: selectedIds } },
        data: { quizId: quiz.id }
    })

    return {
        success: true,
        quizId: quiz.id,
        questionCount: selectedIds.length
    }
}
