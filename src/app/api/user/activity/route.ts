import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch recent attempts with quiz details
        const attempts = await prisma.attempt.findMany({
            where: {
                userId: session.user.id,
                completedAt: { not: null } // Only completed attempts
            },
            take: 10, // Limit to 10 most recent
            orderBy: {
                completedAt: 'desc'
            },
            include: {
                quiz: {
                    select: {
                        title: true,
                        lesson: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            }
        })

        // Transform to activity feed format
        const activity = attempts.map(attempt => ({
            id: attempt.id,
            type: 'quiz_completion',
            title: attempt.quiz.title,
            date: attempt.completedAt,
            score: attempt.score,
            xpEarned: attempt.xpEarned || 0
        }))

        return NextResponse.json(activity)
    } catch (error) {
        console.error('Error fetching activity:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
