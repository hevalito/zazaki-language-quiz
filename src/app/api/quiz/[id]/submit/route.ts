import { NextRequest, NextResponse } from 'next/server'
import { checkBadges } from '@/lib/gamification'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isSameBerlinDay } from '@/lib/date-utils'

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

    // Find the active attempt
    const attempt = await prisma.attempt.findFirst({
      where: {
        userId: session.user.id,
        quizId: params.id,
        completedAt: null
      },
      include: {
        answers: {
          include: { question: { include: { choices: true } } }
        }
      }
    })

    if (!attempt) {
      // Fallback: If no active attempt exists (rare), maybe create one? 
      // Or return error.
      return NextResponse.json({ error: 'No active quiz attempt found' }, { status: 404 })
    }

    // Load Quiz for points calculation / validation
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

    // Check if user has previously EARNED XP for this quiz
    // This allows them to retry if they failed (0 XP) or restarted (0 XP),
    // but prevents farming if they already succeeded.
    const previousXpAttempts = await prisma.attempt.count({
      where: {
        userId: session.user.id,
        quizId: params.id,
        completedAt: { not: null },
        xpEarned: { gt: 0 }
      }
    })

    const hasEarnedXpBefore = previousXpAttempts > 0

    // DAILY QUIZ LOGIC: Check date
    // Only the CURRENT daily quiz awards XP.
    let forceZeroXP = false
    if (quiz.type === 'DAILY' && quiz.date) {
      const now = new Date()
      const quizDate = new Date(quiz.date)

      // Compare YYYY-MM-DD in Berlin Time
      const isSameDay = isSameBerlinDay(new Date(), quizDate)

      if (!isSameDay) {
        forceZeroXP = true
      }
    }

    // Calculate Scores from STORED answers
    let totalScore = 0
    let maxScore = 0
    const results: any[] = []

    // Map through questions to ensure we account for all, 
    // though `attempt.answers` contains what user answered.
    // Unanswered questions score 0.

    for (const question of quiz.questions) {
      maxScore += question.points

      const answer = attempt.answers.find(a => a.questionId === question.id)
      let isCorrect = false
      let pointsEarned = 0

      if (answer) {
        // Validate again or trust stored result? 
        // Trust stored result which was validated on /answer
        isCorrect = answer.isCorrect
        pointsEarned = answer.pointsEarned
        totalScore += pointsEarned

        // Update spaced repetition (if not done already)
        await updateSpacedRepetition(session.user.id, question.id, isCorrect)
      }

      results.push({
        questionId: question.id,
        isCorrect,
        pointsEarned,
        correctChoiceId: question.choices.find(c => c.isCorrect)?.id,
        explanation: question.explanation
      })
    }

    const xpEarned = (hasEarnedXpBefore || forceZeroXP) ? 0 : totalScore

    // Update the attempt to COMPLETE it
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        completedAt: new Date(),
        score: totalScore,
        xpEarned,
        maxScore
      }
    })

    // Update user XP and progress
    // Only update if xpEarned > 0 to avoid unnecessary DB writes or progress confusion
    if (xpEarned > 0) {
      await updateUserProgress(session.user.id, xpEarned, quiz.lessonId)
    }

    // Check for new badges only if new XP was obtained
    let newBadges: any[] = []
    if (xpEarned > 0) {
      const badgeResult = await checkBadges(session.user.id)
      newBadges = badgeResult.newBadges
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score: totalScore,
      maxScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      xpEarned,
      results,
      newBadges
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
    if (xpEarned > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: {
            increment: xpEarned
          }
        }
      })
    }

    // Update lesson progress if applicable
    if (lessonId) {
      // Logic for lesson completion?
      // For now just tracking XP.
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
          },
          completed: true // Mark lesson as involved/completed?
        },
        create: {
          userId,
          lessonId,
          xpEarned,
          completed: true
        }
      })
    }
  } catch (error) {
    console.error('Error updating user progress:', error)
  }
}
