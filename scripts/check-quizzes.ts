
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Quizzes in DB...')

    const quizzes = await prisma.quiz.findMany({
        include: {
            lesson: {
                select: {
                    title: true,
                    chapter: {
                        select: { title: true }
                    }
                }
            },
            questions: {
                select: { id: true }
            }
        }
    })

    console.log(`Found ${quizzes.length} quizzes:`)
    quizzes.forEach(q => {
        console.log(`- [${q.id}] ${JSON.stringify(q.title)} (Type: ${q.type}, Date: ${q.date})`)
        console.log(`  Questions: ${q.questions.length}`)
        console.log(`  Context: ${q.lesson ? 'Lesson: ' + JSON.stringify(q.lesson.title) : 'Standalone'}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
