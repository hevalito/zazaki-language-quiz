
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getDueItems, sortByPriority } from '@/lib/spaced-repetition'
import { Question } from '@prisma/client'
import { logActivity } from '@/lib/activity'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch ALL spaced items for this user that are due
        // We fetch logic-side because "due" depends on date comparison which is easier in JS/App logic 
        // or simple LessThanOrEqual query.
        const now = new Date()

        // Fetch items due before NOW
        // Order by repetition ASC (New mistakes/items first), then dueDate
        const dueSpacedItems = await prisma.spacedItem.findMany({
            where: {
                userId: session.user.id,
                dueDate: {
                    lte: now
                }
            },
            include: {
                question: {
                    include: {
                        choices: true,
                        quiz: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { repetition: 'asc' }, // Failures/New items first (repetition 0)
                { dueDate: 'asc' }     // Then by most overdue
            ],
            take: 20 // Batch size
        })

        let questions: any[] = []

        if (dueSpacedItems.length > 0) {
            questions = dueSpacedItems.map(item => {
                // Shuffle choices for better learning effect
                const shuffledChoices = [...item.question.choices].sort(() => Math.random() - 0.5)

                return {
                    ...item.question,
                    choices: shuffledChoices,
                    _spacedItem: {
                        id: item.id,
                        easiness: item.easiness,
                        interval: item.interval,
                        repetition: item.repetition
                    }
                }
            })
        } else {
            // MIX IT UP: If no due items, return an empty list? 
            // User requested "mix in some other questions". 
            // BUT also said "The learning room will be empty as long as you didn't answer any quizzes".
            // Let's stick to strict mistakes/due items for now as per "Learning room is individual... adapting to answers".
            // If empty, return success/empty state.
            questions = []
        }

        // Shuffle questions slightly? No, priority order is good. 
        // But maybe detailed sort? We used DB orderBy, which is good.

        // Log Session Start
        const activity = await logActivity(
            session.user.id,
            'LEARNING_SESSION_STARTED',
            {
                totalQuestions: questions.length,
                answered: 0,
                correct: 0
            },
            'IN_PROGRESS'
        )

        return NextResponse.json({
            questions,
            count: questions.length,
            activityId: activity?.id
        })

    } catch (error) {
        console.error('Error fetching learning questions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
