
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { updateSpacedRepetition } from '@/lib/spaced-repetition'
import { logActivity } from '@/lib/activity'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { questionId, choiceId, activityId } = await request.json()

        // 1. Validate Answer
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { choices: true }
        })

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 })
        }

        const selectedChoice = question.choices.find(c => c.id === choiceId)
        const isCorrect = selectedChoice?.isCorrect || false

        // 2. Update Spaced Repetition Logic (The Core of Learning Room)
        await updateSpacedRepetition(session.user.id, questionId, isCorrect)

        // 3. Log Activity (Aggregate if session exists, otherwise individual)
        if (activityId) {
            const sessionActivity = await prisma.activity.findUnique({ where: { id: activityId } })
            if (sessionActivity && sessionActivity.metadata) {
                const meta = sessionActivity.metadata as any
                const answered = (meta.answered || 0) + 1
                const correct = (meta.correct || 0) + (isCorrect ? 1 : 0)

                await logActivity(
                    session.user.id,
                    'LEARNING_SESSION_STARTED',
                    { ...meta, answered, correct },
                    'IN_PROGRESS',
                    activityId
                )
            }
        } else {
            // Fallback for individual logging
            await logActivity(session.user.id, 'LEARNING_PRACTICE', {
                questionId,
                isCorrect,
                questionType: question.type
            })
        }

        // 4. Return result + Explanation (CRITICAL for learning)
        // NO XP Awarded.

        return NextResponse.json({
            isCorrect,
            correctChoiceId: question.choices.find(c => c.isCorrect)?.id,
            explanation: question.explanation
        })

    } catch (error) {
        console.error('Error submitting learning answer:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
