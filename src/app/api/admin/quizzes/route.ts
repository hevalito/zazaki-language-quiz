import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const quizzes = await prisma.quiz.findMany({
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
            orderBy: {
                updatedAt: 'desc'
            }
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
