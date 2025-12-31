import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            where: {
                isPublished: true
            },
            orderBy: {
                order: 'asc'
            },
            select: {
                id: true,
                title: true,
                level: true,
                _count: {
                    select: {
                        chapters: true
                    }
                }
            }
        })

        return NextResponse.json(courses)
    } catch (error) {
        console.error('Error fetching courses:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
