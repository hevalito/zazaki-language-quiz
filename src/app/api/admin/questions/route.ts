import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'


export async function GET(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const poolOnly = searchParams.get('pool') === 'true'
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
        const difficulty = searchParams.get('difficulty')
        const type = searchParams.get('type')

        const where: any = {}
        if (poolOnly) {
            where.quizId = null
        }
        if (difficulty && difficulty !== 'all') {
            where.difficulty = parseInt(difficulty)
        }
        if (type && type !== 'all') {
            where.type = type
        }

        // Validate sort field to prevent injection/errors
        const validSortFields = ['createdAt', 'points', 'difficulty']
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

        const questions = await prisma.question.findMany({
            where,
            include: {
                choices: true,
                quiz: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { [sortField]: sortOrder }
        })

        return NextResponse.json(questions)
    } catch (error) {
        console.error('Error fetching questions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // Basic validation
        if (!data.prompt) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const question = await prisma.question.create({
            data: {
                quizId: data.quizId || null,
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
