
import { prisma } from '@/lib/prisma'
import { getBerlinStartOfDay, isSameBerlinDay } from '@/lib/date-utils'

export async function generateDailyQuiz() {
    // Use Berlin Time to determine "Today"
    // This ensures that if the script runs at 23:00 UTC (00:00 Berlin),
    // we generate a quiz for the NEW Berlin day, not the old UTC day.
    const now = new Date()
    const berlinToday = getBerlinStartOfDay(now)

    // Check if quiz already exists for this Berlin Days
    // We check if a quiz exists with a date that matches today's Berlin date.
    // Since we store date as DateTime, we look for anything in that 24h range in Berlin.

    // Simpler: Just check if we created a quiz where isSameBerlinDay(quiz.date, now) is true.
    // But specific Prisma query is better for DB performance.

    // We can't easy do timezone math in Prisma without raw query or complex filters.
    // Instead, let's just fetch recent daily quizzes and check in memory.
    // Or, define a range for fetching.

    // Fallback: Fetch last daily quiz
    const lastDailyQuiz = await prisma.quiz.findFirst({
        where: { type: 'DAILY' },
        orderBy: { date: 'desc' }
    })

    // If last quiz was today (Berlin Time), skip.
    if (lastDailyQuiz && isSameBerlinDay(lastDailyQuiz.date, berlinToday)) {
        return { success: false, message: 'Daily quiz for today already exists.', quizId: lastDailyQuiz.id }
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
    // Use berlinToday as the official date of the quiz
    const dateStr = berlinToday.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }) // YYYY-MM-DD
    const title = {
        en: `Daily Quiz ${dateStr}`,
        de: `Tagesquiz ${dateStr}`
    }

    const quiz = await prisma.quiz.create({
        data: {
            type: 'DAILY',
            date: berlinToday, // Store the Berlin Midnight timestamp
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
