import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                nickname: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                dailyGoal: true,
                preferredScript: true,
                hasSeenTour: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { nickname, firstName, lastName, dailyGoal, preferredScript } = body

        // Validate inputs if necessary

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                nickname,
                firstName,
                lastName,
                dailyGoal: dailyGoal ? parseInt(dailyGoal) : undefined,
                preferredScript,
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
