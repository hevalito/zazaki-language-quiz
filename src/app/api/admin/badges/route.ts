import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const badges = await prisma.badge.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(badges)
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
        if (!data.code || !data.title || !data.description || !data.criteria) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const badge = await prisma.badge.create({
            data: {
                code: data.code,
                title: data.title,
                description: data.description,
                iconUrl: data.iconUrl,
                criteria: data.criteria,
                isActive: data.isActive ?? true
            }
        })

        return NextResponse.json(badge)
    } catch (error) {
        console.error('Error creating badge:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
