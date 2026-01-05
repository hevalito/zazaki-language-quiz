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
        const sortBy = searchParams.get('sortBy') || 'updatedAt'
        const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
        const status = searchParams.get('status')
        const type = searchParams.get('type')

        const where: any = {}
        if (status === 'published') where.isPublished = true
        if (status === 'draft') where.isPublished = false
        if (type && type !== 'all') where.type = type

        let orderBy: any = {}
        if (sortBy === 'questionsCount') {
            orderBy = { questions: { _count: sortOrder } }
        } else {
            // Default or title/updatedAt
            // Validate basic fields
            const valid = ['title', 'updatedAt', 'createdAt']
            const field = valid.includes(sortBy) ? sortBy : 'updatedAt'
            orderBy = { [field]: sortOrder }
        }

        const quizzes = await prisma.quiz.findMany({
            where,
            include: {
                lesson: {
                    select: {
                        title: true,
                        chapter: {
                            select: {
                                title: true,
                                course: {
                                    select: {
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        questions: true
                    }
                }
            },
            orderBy
        })

        return NextResponse.json(quizzes)
    } catch (error) {
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
        if (!data.lessonId || !data.title) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const quiz = await prisma.quiz.create({
            data: {
                title: data.title,
                description: data.description,
                lessonId: data.lessonId,
                order: data.order || 0,
                isPublished: data.isPublished ?? false,
                config: data.config || {}
            }
        })

        return NextResponse.json(quiz)
    } catch (error) {
        console.error('Error creating quiz:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
