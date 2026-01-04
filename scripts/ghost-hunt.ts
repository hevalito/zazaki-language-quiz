
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('👻 Hunting for Ghosts...')

    // Fetch all questions
    const questions = await prisma.question.findMany({
        select: {
            id: true,
            prompt: true,
            quizId: true,
            quiz: {
                select: { id: true, title: true, type: true }
            }
        }
    })

    console.log(`Found ${questions.length} total questions.`)

    const orphans: any[] = []
    const valid: any[] = []

    questions.forEach(q => {
        if (q.quizId) {
            if (q.quiz) {
                valid.push({ qId: q.id, prompt: JSON.stringify(q.prompt).substring(0, 50), quiz: q.quiz.title })
            } else {
                orphans.push({ qId: q.id, prompt: JSON.stringify(q.prompt).substring(0, 50), quizId: q.quizId })
            }
        } else {
            // In pool
        }
    })

    console.log(`\n--- Valid Links (${valid.length}) ---`)
    // Group by Quiz
    const grouped: Record<string, number> = {}
    valid.forEach(v => {
        const k = JSON.stringify(v.quiz)
        grouped[k] = (grouped[k] || 0) + 1
    })
    console.table(grouped)

    console.log(`\n--- Orphans (QuizId exists but Quiz NOT found) (${orphans.length}) ---`)
    if (orphans.length > 0) {
        console.table(orphans)
    } else {
        console.log("No orphans found. Referential integrity seems intact.")
    }

    // Check if any quiz has `lesson: null` but `type: STANDARD` (might be hidden in UI if filtered)
    const quizzes = await prisma.quiz.findMany({
        include: { lesson: true }
    })
    console.log(`\n--- Quizzes check ---`)
    quizzes.forEach(q => {
        console.log(`[${q.id}] ${JSON.stringify(q.title)} / Type: ${q.type} / Lesson: ${q.lesson ? 'Yes' : 'NULL'}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
