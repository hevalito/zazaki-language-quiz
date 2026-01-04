import { generateDailyQuiz } from '@/lib/daily-quiz'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import LowQuestionsPoolEmail from '@/components/emails/low-questions-pool-email'

const prisma = new PrismaClient()

// Ensure we have a DB connection (lib/prisma.ts might rely on globalThis, which is fine for scripts too)
// But scripts executed via tsx or node might need explicit disconnection.

async function main() {
    console.log('Generating Daily Quiz...')
    try {

        const result = await generateDailyQuiz()
        if (result.success) {
            console.log('Success:', result)

            // Check pool size and alert admins if low
            const poolCount = await prisma.question.count({
                where: { quizId: { equals: null } }
            })

            console.log(`Remaining pool size: ${poolCount}`)

            if (poolCount < 10) {
                console.log('Pool is low! Sending alerts to admins...')

                const admins = await prisma.user.findMany({
                    where: { isAdmin: true },
                    select: { email: true }
                })

                if (admins.length > 0 && process.env.AUTH_RESEND_KEY) {
                    const resend = new Resend(process.env.AUTH_RESEND_KEY)
                    const daysLeft = Math.floor(poolCount / 5)

                    // Send to first admin for now, or loop through all (Resend supports batch or single)
                    // We'll loop to be safe and personal
                    for (const admin of admins) {
                        if (admin.email) {
                            try {
                                await resend.emails.send({
                                    from: 'Zazakî Quiz Bot <noreply@zazakiacademy.com>',
                                    to: admin.email,
                                    subject: '⚠️ Wichtige Warnung: Fragenpool fast leer',
                                    react: LowQuestionsPoolEmail({
                                        remainingCount: poolCount,
                                        daysLeft: daysLeft,
                                        adminUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/admin/questions` : 'https://quiz.zazakiacademy.com/admin/questions'
                                    })
                                })
                                console.log(`Alert sent to ${admin.email}`)
                            } catch (emailError) {
                                console.error(`Failed to email ${admin.email}:`, emailError)
                            }
                        }
                    }
                } else {
                    console.log('No admins found or AUTH_RESEND_KEY missing.')
                }
            }

        } else {
            console.error('Failed:', result.message)
            process.exit(1) // Exit with error for Cron monitoring
        }
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    } finally {
        // Explicitly disconnect to allow script to exit
        await prisma.$disconnect()
    }
}

main()
