
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
            }))

            // Sort to match original order if possible, or random
            // Since we just fetched by ID, the order is DB-dependent.
            // Ideally we'd preserve the original shuffle from metadata, but random remaining is fine.

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
        // Fetch Quizzes the user has actually attempted
        const attempts = await prisma.attempt.findMany({
            where: { userId },
            select: { quizId: true },
            distinct: ['quizId']
        })
        const attemptedQuizIds = attempts.map(a => a.quizId)

        // 1. Fetch Active Items (Mistakes & Due)
        const activeItems = await prisma.spacedItem.findMany({
            where: {
                userId,
                OR: [
                    { stage: { lt: 3 } },
                    { dueDate: { lte: now } }
                ]
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
        const freshQuestions = await prisma.question.findMany({
            where: {
                quizId: { in: attemptedQuizIds },
                spacedItems: { none: { userId } }
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
            },
            take: 6
        })

        let combinedQuestions: any[] = []

        const formatItem = (q: any, spacedItem?: any) => ({
            ...q,
            choices: [...q.choices].sort(() => Math.random() - 0.5),
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
            const moreFresh = await prisma.question.findMany({
                where: {
                    quizId: { in: attemptedQuizIds },
                    spacedItems: { none: { userId } },
                    id: { notIn: freshQuestions.map(q => q.id) }
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
                },
                take: 20 - combinedQuestions.length
            })
            moreFresh.forEach(q => combinedQuestions.push(formatItem(q)))
        }

        if (combinedQuestions.length < 5) {
            const moreStable = await prisma.spacedItem.findMany({
                where: {
                    userId,
                    id: { notIn: [...activeItems, ...stableItems].map(i => i.id) }
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
                take: 20 - combinedQuestions.length
            })
            moreStable.forEach(item => combinedQuestions.push(formatItem(item.question, item)))
        }

        const finalQuestions = combinedQuestions.sort(() => Math.random() - 0.5)
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

