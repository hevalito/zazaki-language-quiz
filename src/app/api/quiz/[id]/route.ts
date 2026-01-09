import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            choices: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        lesson: {
          include: {
            chapter: {
              include: {
                course: true
              }
            }
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Don't send correct answers to client
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map(question => ({
        ...question,
        choices: question.choices.map(choice => ({
          id: choice.id,
          label: choice.label,
          order: choice.order,
          mediaUrl: choice.mediaUrl,
          isCorrect: choice.isCorrect
        }))
      }))
    }

    // Find or create active attempt
    let attempt = await prisma.attempt.findFirst({
      where: {
        userId: session.user.id,
        quizId: params.id,
        completedAt: null
      },
      include: {
        answers: true
      }
    })

    if (!attempt) {
      attempt = await prisma.attempt.create({
        data: {
          userId: session.user.id,
          quizId: params.id
        },
        include: {
          answers: true
        }
      })

      // Log START activity
      const activity = await logActivity(
        session.user.id,
        'QUIZ_STARTED',
        {
          quizId: quiz.id,
          quizTitle: quiz.title,
          attemptId: attempt.id
        },
        'STARTED'
      )

      if (activity) {
        await prisma.attempt.update({
          where: { id: attempt.id },
          data: { metadata: { activityId: activity.id } }
        })
      }
    }

    return NextResponse.json({
      ...sanitizedQuiz,
      activeAttempt: attempt
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
