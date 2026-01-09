
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

        // --- SESSION CLEANUP ---
        // Ensure only one "Live" session exists. Mark any old IN_PROGRESS sessions as COMPLETED.
        await prisma.activity.updateMany({
            where: {
                userId,
                type: 'LEARNING_SESSION_STARTED',
                status: 'IN_PROGRESS'
            },
            data: {
                status: 'COMPLETED', // Use COMPLETED as ABANDONED isn't in enum without migration
                // updatedAt: now  <-- REMOVED: Do not bump timestamp to avoid moving to top of stream
            }
        })

        // --- THE MIX RECIPE ---
        // Target Session Size: 20
        // 1. Active/Mistakes: ~60% (12 items) -> Stage < 3 OR Due
        // 2. Fresh/New: ~30% (6 items) -> Not seen yet
        // 3. Stable/Review: ~10% (2 items) -> Stage >= 3

        // Fetch Quizzes the user has actually attempted
        // ("Only questions from daily quizzes and quizzes the user has taken")
        const attempts = await prisma.attempt.findMany({
            where: { userId },
            select: { quizId: true },
            distinct: ['quizId']
        })
        const attemptedQuizIds = attempts.map(a => a.quizId)

        // If user has NEVER taken a quiz, the room handles it naturally:
        // - Active/Stable might exist if seeded elsewhere (unlikely)
        // - Fresh/Fallback will returns empty because quizId in [] is empty
        // Result: Empty room, which is correct behavior for a new user.

        // 1. Fetch Active Items (Mistakes & Due)
        // These are inherently "touched" because they have a SpacedItem record
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
        // MUST be from quizzes the user has taken (e.g. skipped questions or added later)
        // Cannot be random pool questions.
        const freshQuestions = await prisma.question.findMany({
            where: {
                // Only from attempted quizzes
                quizId: { in: attemptedQuizIds },
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
        // STILL restricted to attempted quizzes
        if (combinedQuestions.length < 10) {
            const moreFresh = await prisma.question.findMany({
                where: {
                    quizId: { in: attemptedQuizIds },
                    spacedItems: { none: { userId } },
                    id: { notIn: freshQuestions.map(q => q.id) } // Exclude already picked
                },
                include: { choices: true, quiz: { select: { title: true } } },
                take: 20 - combinedQuestions.length
            })
            moreFresh.forEach(q => combinedQuestions.push(formatItem(q)))
        }

        // FALLBACK 2: If still low, more Stable (Review ahead of time)
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
