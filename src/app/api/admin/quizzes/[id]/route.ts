import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: params.id
            },
            include: {
                lesson: {
                    include: {
                        chapter: {
                            include: {
                                course: true
                            }
                        }
                    }
                },
                questions: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        choices: {
                            orderBy: {
                                order: 'asc'
                            }
                        }
                    }
                }
            }
        })

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
        }

        return NextResponse.json(quiz)
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const quiz = await prisma.quiz.update({
            where: {
                id: params.id
            },
            data: {
                title: data.title,
                description: data.description,
                lessonId: data.lessonId,
                order: data.order,
                isPublished: data.isPublished,
                config: data.config
            }
        })

        return NextResponse.json(quiz)
    } catch (error) {
        console.error('Error updating quiz:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.quiz.delete({
            where: {
                id: params.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting quiz:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
