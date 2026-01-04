import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { questionId, choiceId, timeSpent } = await request.json()

        // Find active attempt
        const attempt = await prisma.attempt.findFirst({
            where: {
                userId: session.user.id,
                quizId: params.id,
                completedAt: null
            }
        })

        if (!attempt) {
            return NextResponse.json({ error: 'No active attempt found' }, { status: 404 })
        }

        // Check if already answered (Cheating Prevention)
        const existingAnswer = await prisma.answer.findFirst({
            where: {
                attemptId: attempt.id,
                questionId: questionId
            }
        })

        if (existingAnswer) {
            return NextResponse.json({ error: 'Question already answered', answer: existingAnswer }, { status: 400 })
        }

        // Fetch question and choice to verify correctness
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { choices: true }
        })

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 })
        }

        const selectedChoice = question.choices.find(c => c.id === choiceId)
        const isCorrect = selectedChoice?.isCorrect || false
        const pointsEarned = isCorrect ? question.points : 0

        // Create Answer
        const answer = await prisma.answer.create({
            data: {
                attemptId: attempt.id,
                questionId,
                result: isCorrect ? 'CORRECT' : 'INCORRECT',
                isCorrect,
                pointsEarned,
                timeSpent: timeSpent || 0,
                responseData: { choiceId }
            }
        })

        // Update attempt stats (optional, but good for realtime tracking)
        await prisma.attempt.update({
            where: { id: attempt.id },
            data: {
                score: { increment: pointsEarned },
                timeSpent: { increment: Math.floor((timeSpent || 0) / 1000) }
            }
        })

        return NextResponse.json(answer)
    } catch (error) {
        console.error('Error saving answer:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
