import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const quizzes = await prisma.quiz.findMany({
            where: {
                type: 'DAILY'
            },
            select: {
                id: true,
                date: true,
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        const formatted = quizzes.map(q => ({
            id: q.id,
            date: q.date,
            questionCount: q._count.questions
        }))

        return NextResponse.json(formatted)
    } catch (error) {
        console.error('History Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
