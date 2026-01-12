
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
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        // --- STATS AGGREGATION LOGIC (For Global Mastery Score) ---
        if (action === 'stats') {
            const allItems = await prisma.spacedItem.findMany({
                where: { userId },
                select: { stage: true }
            })

            const totalItems = allItems.length
            if (totalItems === 0) {
                return NextResponse.json({
                    masteryPercentage: 0,
                    totalXP: 0,
                    totalItems: 0,
                    breakdown: { locked: 0, learning: 0, review: 0, mastered: 0 }
                })
            }

            // Calculate Aggregate Stats
            // Mastery = (Sum of Stages) / (Total Items * 5) * 100
            // This represents the "health" of the user's crystallized knowledge.
            const totalStageSum = allItems.reduce((acc, item) => acc + item.stage, 0)
            const maxPossibleScore = totalItems * 5
            const masteryPercentage = (totalStageSum / maxPossibleScore) * 100

            // Breakdown for future visualizations if needed
            const breakdown = {
                locked: 0, // Not really tracked in SpacedItem unless we fetch all Questions
                learning: allItems.filter(i => i.stage > 0 && i.stage < 3).length,
                review: allItems.filter(i => i.stage >= 3 && i.stage < 5).length,
                mastered: allItems.filter(i => i.stage === 5).length,
                // Items at stage 0 are technically "New" or "Forgot"
                new: allItems.filter(i => i.stage === 0).length
            }

            return NextResponse.json({
                masteryPercentage: Number(masteryPercentage.toFixed(1)),
                totalXP: totalStageSum,
                totalItems,
                breakdown
            })
        }

        // 1. Check for Active Session
        const activeSession = await prisma.activity.findFirst({
            where: {
                userId,
                type: 'LEARNING_SESSION_STARTED',
                status: 'IN_PROGRESS'
            },
            orderBy: { createdAt: 'desc' }
        })

        // RESUME LOGIC (Default behavior unless action=start)
        if (activeSession && action !== 'start') {
            const meta = activeSession.metadata as any
            const sessionQuestionIds = (meta.questionIds || []) as string[]
            const answeredIds = (meta.answeredIds || []) as string[]

            // Determine remaining questions
            const remainingIds = sessionQuestionIds.filter(id => !answeredIds.includes(id))

            if (remainingIds.length === 0) {
                // Edge case: Session exists but is effectively done.
                // Mark as completed and return empty (User will see "Done" and can start new)
                await prisma.activity.update({
                    where: { id: activeSession.id },
                    data: { status: 'COMPLETED' }
                })
                return NextResponse.json({ questions: [], count: 0, activityId: null })
            }

            // Fetch detail for remaining questions
            const resumeQuestions = await prisma.question.findMany({
                where: { id: { in: remainingIds } },
                include: {
                    choices: true,
                    // Deep context fetching
                    quiz: {
                        select: {
                            title: true,
                            type: true,
                            lesson: {
                                select: {
                                    title: true,
                                    chapter: {
                                        select: {
                                            title: true,
                                            course: {
                                                select: {
                                                    title: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            // Format similarly to new session
            const formatted = resumeQuestions.map(q => ({
                ...q,
                choices: [...q.choices].sort(() => Math.random() - 0.5)
            })).sort(() => Math.random() - 0.5) // SHUFFLE the resumed questions to avoid sequential order

            return NextResponse.json({
                questions: formatted,
                count: formatted.length,
                activityId: activeSession.id
            })
        }

        // IF NO ACTIVE SESSION and NO START ACTION
        if (!activeSession && action !== 'start') {
            // Signal frontend to show "Start" screen
            return NextResponse.json({ questions: [], count: 0, activityId: null })
        }

        // --- START NEW SESSION LOGIC ---
        // (Action === 'start' OR (auto-start logic if we wanted it, but we don't anymore))

        // CLEANUP: If we are forcefully starting, close any old IN_PROGRESS sessions
        if (activeSession) {
            await prisma.activity.update({
                where: { id: activeSession.id },
                data: { status: 'COMPLETED' }
            })
        }

        // ... [Existing Mix Logic - Active/Stable/Fresh] ...
        // Fetch Quizzes the user has actually attempted (and engaged with!)
        // Filter out quizzes where the user just started (Attempt created) but answered nothing.
        const attempts = await prisma.attempt.findMany({
            where: {
                userId,
                answers: { some: {} } // valid attempt must have at least one answer
            },
            select: { quizId: true },
            distinct: ['quizId']
        })
        const attemptedQuizIds = attempts.map(a => a.quizId)

        // 1. Fetch Active Items (Mistakes & Due)
        const activeItems = await prisma.spacedItem.findMany({
            where: {
                userId,
                dueDate: { lte: now }
            },
            include: {
                question: {
                    include: {
                        choices: true,
                        quiz: {
                            select: {
                                title: true,
                                type: true,
                                lesson: {
                                    select: {
                                        title: true,
                                        chapter: {
                                            select: {
                                                title: true,
                                                course: { select: { title: true } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: [
                { repetition: 'asc' },
                { dueDate: 'asc' }
            ],
            take: 12
        })

        // 2. Fetch Stable Items
        const stableItems = await prisma.spacedItem.findMany({
            where: {
                userId,
                stage: { gte: 3 },
                dueDate: { gt: now }
            },
            include: {
                question: {
                    include: {
                        choices: true,
                        quiz: {
                            select: {
                                title: true,
                                type: true,
                                lesson: {
                                    select: {
                                        title: true,
                                        chapter: {
                                            select: {
                                                title: true,
                                                course: { select: { title: true } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: 2
        })

        // 3. Fetch Fresh Items
        // IMPROVED: Randomize selection by fetching IDs first, shuffling, then fetching detail.
        // This prevents "clustering" where all fresh items come from the first attempted quiz.
        const allFreshCandidateIds = await prisma.question.findMany({
            where: {
                quizId: { in: attemptedQuizIds },
                spacedItems: { none: { userId } },
                // STRICT RULE: Only questions the user has actually answered.
                // This prevents pulling in unseen questions from "started" but unfinished quizzes.
                answers: { some: { attempt: { userId } } }
            },
            select: { id: true }
        })

        // Shuffle candidate IDs
        const shuffledFreshIds = fisherYatesShuffle(allFreshCandidateIds.map(q => q.id)).slice(0, 6)

        const freshQuestions = await prisma.question.findMany({
            where: {
                id: { in: shuffledFreshIds }
            },
            include: {
                choices: true,
                quiz: {
                    select: {
                        title: true,
                        type: true,
                        lesson: {
                            select: {
                                title: true,
                                chapter: {
                                    select: {
                                        title: true,
                                        course: { select: { title: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        let combinedQuestions: any[] = []

        const formatItem = (q: any, spacedItem?: any) => ({
            ...q,
            choices: fisherYatesShuffle([...q.choices]),
            _spacedItem: spacedItem ? {
                id: spacedItem.id,
                easiness: spacedItem.easiness,
                interval: spacedItem.interval,
                repetition: spacedItem.repetition,
                stage: spacedItem.stage
            } : undefined
        })

        activeItems.forEach(item => combinedQuestions.push(formatItem(item.question, item)))
        stableItems.forEach(item => combinedQuestions.push(formatItem(item.question, item)))
        freshQuestions.forEach(q => combinedQuestions.push(formatItem(q)))

        // Fallbacks
        if (combinedQuestions.length < 10) {
            // Re-use the pool of fresh IDs we already fetched, excluding the ones we already picked
            const remainingFreshIds = allFreshCandidateIds
                .map(q => q.id)
                .filter(id => !shuffledFreshIds.includes(id))

            const moreFreshIds = fisherYatesShuffle(remainingFreshIds).slice(0, 20 - combinedQuestions.length)

            if (moreFreshIds.length > 0) {
                const moreFresh = await prisma.question.findMany({
                    where: { id: { in: moreFreshIds } },
                    include: {
                        choices: true,
                        quiz: {
                            select: {
                                title: true,
                                type: true,
                                lesson: {
                                    select: {
                                        title: true,
                                        chapter: {
                                            select: {
                                                title: true,
                                                course: { select: { title: true } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                moreFresh.forEach(q => combinedQuestions.push(formatItem(q)))
            }
        }

        if (combinedQuestions.length < 20) {
            // Fallback: Fill the session with "Review Ahead" items (future due date),
            // BUT enforce a cooldown to solve "repeating same question same day" weirdness.
            // We randomize heavily to allow "100 sessions" to cycle through the entire backlog.

            const cooldownDate = new Date()
            cooldownDate.setHours(cooldownDate.getHours() - 12)

            const fallbackCandidateIds = await prisma.spacedItem.findMany({
                where: {
                    userId,
                    // Exclude currently selected SpacedItems
                    id: { notIn: combinedQuestions.map(q => q._spacedItem?.id).filter(Boolean) as string[] },
                    // CRITICAL: Don't show items reviewed today/recently to avoid "just did this" feeling.
                    OR: [
                        { lastReview: { lt: cooldownDate } },
                        { lastReview: null }
                    ]
                },
                select: { id: true }
            })

            const needed = 20 - combinedQuestions.length
            const shuffledFallbackIds = fisherYatesShuffle(fallbackCandidateIds.map(i => i.id)).slice(0, needed)

            if (shuffledFallbackIds.length > 0) {
                const moreStable = await prisma.spacedItem.findMany({
                    where: { id: { in: shuffledFallbackIds } },
                    include: {
                        question: {
                            include: {
                                choices: true,
                                quiz: {
                                    select: {
                                        title: true,
                                        type: true,
                                        lesson: {
                                            select: {
                                                title: true,
                                                chapter: {
                                                    select: {
                                                        title: true,
                                                        course: { select: { title: true } }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                moreStable.forEach(item => combinedQuestions.push(formatItem(item.question, item)))
            }
        }

        const finalQuestions = fisherYatesShuffle(combinedQuestions)
        const finalQuestionIds = finalQuestions.map(q => q.id)

        // Log Session Start with PERSISTENCE METADATA
        const activity = await logActivity(
            userId,
            'LEARNING_SESSION_STARTED',
            {
                totalQuestions: finalQuestions.length,
                answered: 0,
                correct: 0,
                // PERSISTENCE KEYS
                questionIds: finalQuestionIds,
                answeredIds: [],
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

// Utility: Fisher-Yates Shuffle
function fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

