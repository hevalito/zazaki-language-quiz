import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // Basic validation
        if (!data.quizId || !data.prompt) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const question = await prisma.question.create({
            data: {
                quizId: data.quizId,
                type: data.type || 'MULTIPLE_CHOICE',
                prompt: data.prompt,
                points: data.points || 10,
                dialectCode: data.dialectCode || 'zazaki-xx',
                difficulty: data.difficulty || 1,
                settings: data.settings || {},
                choices: {
                    create: data.choices?.map((choice: any, index: number) => ({
                        label: choice.label,
                        isCorrect: choice.isCorrect,
                        order: index
                    }))
                }
            }
        })

        return NextResponse.json(question)
    } catch (error) {
        console.error('Error creating question:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
