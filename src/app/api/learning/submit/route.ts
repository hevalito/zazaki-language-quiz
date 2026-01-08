
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { updateSpacedRepetition } from '@/lib/spaced-repetition'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { questionId, choiceId } = await request.json()

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

        // 3. Return result + Explanation (CRITICAL for learning)
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
