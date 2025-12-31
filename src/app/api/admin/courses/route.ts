import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const courses = await prisma.course.findMany({
            orderBy: {
                order: 'asc'
            },
            include: {
                _count: {
                    select: {
                        chapters: true
                    }
                }
            }
        })

        return NextResponse.json(courses)
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

        const course = await prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                level: data.level,
                dialectCode: data.dialectCode || 'zazaki-dimli',
                order: data.order || 0,
                isPublished: data.isPublished || false
            }
        })

        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
