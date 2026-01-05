import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { result, history } = body

        if (!result) {
            return NextResponse.json({ error: 'Missing result data' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                courseFinderData: {
                    result,
                    history,
                    completedAt: new Date().toISOString()
                }
            }
        })

        return NextResponse.json({ success: true, data: updatedUser.courseFinderData })
    } catch (error) {
        console.error('Failed to save course finder result:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
