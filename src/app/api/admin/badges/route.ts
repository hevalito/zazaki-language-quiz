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
        const isActive = searchParams.get('isActive')
        const search = searchParams.get('search')

        const where: any = {}

        if (isActive !== null && isActive !== undefined && isActive !== 'all') {
            where.isActive = isActive === 'true'
        }

        if (search) {
            where.OR = [
                // Prisma JSON filtering has limitations, simple string search might fail on JSON paths if not strictly typed or supported by DB version.
                // Fallback to code search and fetching all + filtering in memory if needed, but 'string_contains' is PostgreSQL specific for JSONB.
                // Let's try simpler exact match or code search first to be safe, or just code.
                { code: { contains: search, mode: 'insensitive' } }
            ]
        }

        const badges = await prisma.badge.findMany({
            where,
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
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
                imageUrl: data.imageUrl,
                conditionLabel: data.conditionLabel,
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
