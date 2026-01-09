
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

        const userId = session.user.id
        const now = new Date()

        // --- THE MIX RECIPE ---
        // Target Session Size: 20
        // 1. Active/Mistakes: ~60% (12 items) -> Stage < 3 OR Due
        // 2. Fresh/New: ~30% (6 items) -> Not seen yet
        // 3. Stable/Review: ~10% (2 items) -> Stage >= 3

        // 1. Fetch Active Items (Mistakes & Due)
        const activeItems = await prisma.spacedItem.findMany({
            where: {
                userId,
                OR: [
                    { stage: { lt: 3 } }, // Mistakes/Unstable
                    { dueDate: { lte: now } } // Due items
                ]
            },
            include: {
                question: {
                    include: {
                        choices: true,
                        quiz: { select: { title: true } }
                    }
                }
            },
            orderBy: [
                { repetition: 'asc' }, // Prioritize new mistakes
                { dueDate: 'asc' }
            ],
            take: 12
        })

        // 2. Fetch Stable Items (Confidence Boosters) - Only if we have some
        const stableItems = await prisma.spacedItem.findMany({
            where: {
                userId,
                stage: { gte: 3 },
                dueDate: { gt: now } // Not due yet, but good for review
            },
            include: {
                question: {
                    include: {
                        choices: true,
                        quiz: { select: { title: true } }
                    }
                }
            },
            take: 2
        })

        // 3. Fetch Fresh Items (New Content)
        // We need items that have NO SpacedItem for this user
        const freshQuestions = await prisma.question.findMany({
            where: {
                spacedItems: {
                    none: {
                        userId
                    }
                }
            },
            include: {
                choices: true,
                quiz: { select: { title: true } }
            },
            take: 6
        })

        // Combine and Formulate the Session
        let combinedQuestions: any[] = []

        // Helper to format item
        const formatItem = (q: any, spacedItem?: any) => ({
            ...q,
            choices: [...q.choices].sort(() => Math.random() - 0.5), // Shuffle choices
            _spacedItem: spacedItem ? {
                id: spacedItem.id,
                easiness: spacedItem.easiness,
                interval: spacedItem.interval,
                repetition: spacedItem.repetition,
                stage: spacedItem.stage // Include stage for debugging/UI
            } : undefined
        })

        // Add Active
        activeItems.forEach(item => combinedQuestions.push(formatItem(item.question, item)))

        // Add Stable
        stableItems.forEach(item => combinedQuestions.push(formatItem(item.question, item)))

        // Add Fresh
        freshQuestions.forEach(q => combinedQuestions.push(formatItem(q)))

        // FALLBACK: If total < 10, try to pull more Fresh items to fill up
        if (combinedQuestions.length < 10) {
            const moreFresh = await prisma.question.findMany({
                where: {
                    spacedItems: { none: { userId } },
                    id: { notIn: freshQuestions.map(q => q.id) } // Exclude already picked
                },
                include: { choices: true, quiz: { select: { title: true } } },
                take: 20 - combinedQuestions.length
            })
            moreFresh.forEach(q => combinedQuestions.push(formatItem(q)))
        }

        // FALLBACK 2: If still low (no fresh content left?), pull more Stable/Review
        if (combinedQuestions.length < 5) {
            const moreStable = await prisma.spacedItem.findMany({
                where: {
                    userId,
                    id: { notIn: [...activeItems, ...stableItems].map(i => i.id) }
                },
                include: { question: { include: { choices: true, quiz: { select: { title: true } } } } },
                take: 20 - combinedQuestions.length
            })
            moreStable.forEach(item => combinedQuestions.push(formatItem(item.question, item)))
        }

        // Shuffle the final mix so the user doesn't know what "type" is coming
        const finalQuestions = combinedQuestions.sort(() => Math.random() - 0.5)

        // Log Session Start
        const activity = await logActivity(
            userId,
            'LEARNING_SESSION_STARTED',
            {
                totalQuestions: finalQuestions.length,
                answered: 0,
                correct: 0,
                mix: {
                    active: activeItems.length,
                    stable: stableItems.length,
                    fresh: freshQuestions.length
                }
            },
            'IN_PROGRESS'
        )

        return NextResponse.json({
            questions: finalQuestions,
            count: finalQuestions.length,
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
