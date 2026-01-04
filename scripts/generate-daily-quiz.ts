
import { generateDailyQuiz } from '@/lib/daily-quiz'
import { PrismaClient } from '@prisma/client'

// Ensure we have a DB connection (lib/prisma.ts might rely on globalThis, which is fine for scripts too)
// But scripts executed via tsx or node might need explicit disconnection.

async function main() {
    console.log('Generating Daily Quiz...')
    try {
        const result = await generateDailyQuiz()
        if (result.success) {
            console.log('Success:', result)
        } else {
            console.error('Failed:', result.message)
            process.exit(1) // Exit with error for Cron monitoring
        }
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

main()
