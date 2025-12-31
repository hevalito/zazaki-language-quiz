import { NextRequest, NextResponse } from 'next/server'
import { checkBadges } from '@/lib/gamification'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

interface SubmitAnswerRequest {
  answers: {
    questionId: string
    choiceId: string
    timeSpent: number
  }[]
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SubmitAnswerRequest = await request.json()
    const { answers } = body

    // Get quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            choices: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Check for previous completed attempts to prevent farming
    const previousAttempts = await prisma.attempt.count({
      where: {
        userId: session.user.id,
        quizId: params.id,
        completedAt: { not: null }
      }
    })

    const isFirstAttempt = previousAttempts === 0

    // Create attempt record
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        quizId: params.id,
        startedAt: new Date(),
        completedAt: new Date(),
        score: 0,
        xpEarned: 0, // Will be updated later
        maxScore: 0,
        timeSpent: answers.reduce((total, answer) => total + answer.timeSpent, 0)
      }
    })

    let totalScore = 0
    let maxScore = 0
    const results: any[] = []

    // Process each answer
    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId)
      if (!question) continue

      const selectedChoice = question.choices.find(c => c.id === answer.choiceId)
      if (!selectedChoice) continue

      const isCorrect = selectedChoice.isCorrect
      const pointsEarned = isCorrect ? question.points : 0

      totalScore += pointsEarned
      maxScore += question.points

      // Save answer record
      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          result: isCorrect ? 'CORRECT' : 'INCORRECT',
          responseData: {
            choiceId: answer.choiceId,
            selectedText: selectedChoice.label
          },
          isCorrect,
          pointsEarned,
          timeSpent: answer.timeSpent
        }
      })

      // Update spaced repetition data
      await updateSpacedRepetition(session.user.id, question.id, isCorrect)

      results.push({
        questionId: question.id,
        isCorrect,
        pointsEarned,
        correctChoiceId: question.choices.find(c => c.isCorrect)?.id,
        explanation: question.explanation
      })
    }

    const xpEarned = isFirstAttempt ? totalScore : 0

    // Update attempt with final scores
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        xpEarned,
        maxScore
      }
    })

    // Update user XP and progress
    await updateUserProgress(session.user.id, xpEarned, quiz.lessonId)

    // Check for new badges
    const { unlockedBadgeTitles } = await checkBadges(session.user.id)

    return NextResponse.json({
      attemptId: attempt.id,
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      results,
      newBadges: unlockedBadgeTitles
    })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateSpacedRepetition(userId: string, questionId: string, isCorrect: boolean) {
  try {
    const existingItem = await prisma.spacedItem.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      }
    })

    if (existingItem) {
      // Update existing spaced repetition item using SM-2 algorithm
      const quality = isCorrect ? 4 : 1 // Simplified quality rating
      let { easiness, interval, repetition } = existingItem

      if (quality >= 3) {
        if (repetition === 0) {
          interval = 1
        } else if (repetition === 1) {
          interval = 6
        } else {
          interval = Math.round(interval * easiness)
        }
        repetition += 1
      } else {
        repetition = 0
        interval = 1
      }

      easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      if (easiness < 1.3) easiness = 1.3

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + interval)

      await prisma.spacedItem.update({
        where: { id: existingItem.id },
        data: {
          easiness,
          interval,
          repetition,
          dueDate,
          lastReview: new Date()
        }
      })
    } else {
      // Create new spaced repetition item
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (isCorrect ? 1 : 0))

      await prisma.spacedItem.create({
        data: {
          userId,
          questionId,
          easiness: 2.5,
          interval: isCorrect ? 1 : 0,
          repetition: isCorrect ? 1 : 0,
          dueDate,
          lastReview: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating spaced repetition:', error)
  }
}

async function updateUserProgress(userId: string, xpEarned: number, lessonId: string | null) {
  try {
    // Update user's total XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: {
          increment: xpEarned
        }
      }
    })

    // Update lesson progress if applicable
    if (lessonId) {
      await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        update: {
          xpEarned: {
            increment: xpEarned
          }
        },
        create: {
          userId,
          lessonId,
          xpEarned,
          completed: false
        }
      })
    }
  } catch (error) {
    console.error('Error updating user progress:', error)
  }
}
