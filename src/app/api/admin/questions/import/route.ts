
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { questions } = body

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: 'No questions provided' }, { status: 400 })
        }

        // Validate structure briefly?
        // Rely on frontend for strict shape, but backend should be safe.
        // We will map exactly to Prisma create.

        const createdQuestions = await prisma.$transaction(
            questions.map((q: any) =>
                prisma.question.create({
                    data: {
                        prompt: q.prompt,
                        type: q.type || 'MULTIPLE_CHOICE',
                        points: q.points || 10,
                        difficulty: q.difficulty || 3, // Medium
                        dialectCode: 'zazaki-dimli', // Default
                        settings: {}, // Required
                        choices: {
                            create: q.choices.map((c: any, index: number) => ({
                                label: c.label,
                                isCorrect: c.isCorrect,
                                order: index
                            }))
                        }
                    }
                })
            )
        )

        return NextResponse.json({
            success: true,
            count: createdQuestions.length
        })

    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
