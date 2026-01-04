
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Questions in Pool...')

    const poolQuestions = await prisma.question.findMany({
        where: { quizId: null },
        select: { id: true, prompt: true }
    })

    console.log(`Found ${poolQuestions.length} detached questions.`)
    if (poolQuestions.length > 0) {
        console.log('First 5:', poolQuestions.slice(0, 5))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
