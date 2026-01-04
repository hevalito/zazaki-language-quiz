
import { NextResponse } from 'next/server'
import { generateDailyQuiz } from '@/lib/daily-quiz'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const cronSecret = req.headers.get('x-cron-secret')

        const isCron = cronSecret === process.env.CRON_SECRET && !!process.env.CRON_SECRET

        if (!isCron) {
            const isAdmin = await requireAdmin()
            if (!isAdmin) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const result = await generateDailyQuiz()

        if (!result.success && result.message === 'Not enough questions in the pool.') {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('Daily Quiz Gen Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
