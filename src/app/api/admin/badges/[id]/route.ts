import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

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

        const badge = await prisma.badge.update({
            where: {
                id: params.id
            },
            data: {
                code: data.code,
                title: data.title,
                description: data.description,
                iconUrl: data.iconUrl,
                imageUrl: data.imageUrl,
                conditionLabel: data.conditionLabel,
                criteria: data.criteria,
                isActive: data.isActive
            }
        })

        return NextResponse.json(badge)
    } catch (error) {
        console.error('Error updating badge:', error)
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

        await prisma.badge.delete({
            where: {
                id: params.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting badge:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        const badge = await prisma.badge.findUnique({
            where: {
                id: params.id
            }
        })

        if (!badge) {
            return NextResponse.json({ error: 'Badge not found' }, { status: 404 })
        }

        return NextResponse.json(badge)
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
