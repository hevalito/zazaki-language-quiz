import { NextRequest, NextResponse } from 'next/server'
import { checkBadges } from '@/lib/gamification'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isSameBerlinDay, getBerlinDateString } from '@/lib/date-utils'
import { getSystemSettings } from '@/lib/settings'
import { updateSpacedRepetition } from '@/lib/spaced-repetition'
import { logActivity } from '@/lib/activity'


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

    const settings = await getSystemSettings()
    let xpEarned = (hasEarnedXpBefore || forceZeroXP) ? 0 : totalScore

    // Apply Global Multiplier
    if (xpEarned > 0 && settings.global_xp_multiplier > 1) {
      xpEarned = Math.round(xpEarned * settings.global_xp_multiplier)
    }

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
    // Check for new badges only if new XP was obtained
    let newBadges: any[] = []

    // STREAK LOGIC:
    // Update streak regardless of XP? Or only if XP > 0?
    // Usually streak requires "learning activity", so XP > 0 is a good proxy.
    // However, if they just repeat a quiz for practice (0 XP), should it count?
    // Let's say yes, meaningful engagement counts. But creating an attempt is enough?
    // Let's stick to: If they finished a quiz, it counts. Even if 0 XP.

    // 1. Fetch current user state for streak
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streak: true, lastActiveDate: true, streakFreezes: true }
    })

    if (currentUser) {
      const todayStr = getBerlinDateString(new Date())
      const lastActiveStr = currentUser.lastActiveDate
        ? getBerlinDateString(currentUser.lastActiveDate)
        : null

      let newStreak = currentUser.streak
      let diffDays = 0

      if (todayStr !== lastActiveStr) {
        // It's a different day. Check if it's consecutive.

        // Calculate "Yesterday" in Berlin
        // We do this by creating a date representing Today Berlin, subtracting 24h, and formatting.
        // Robust way:
        const todayDate = new Date()
        const yesterdayDate = new Date(todayDate)
        yesterdayDate.setDate(yesterdayDate.getDate() - 1)

        // Check if yesterdayDate's Berlin string matches lastActiveStr
        // We might need to be careful about time boundaries (e.g. 00:30 vs 23:30).
        // Safest: Parsing the YYYY-MM-DD strings.

        const lastActiveDateObj = currentUser.lastActiveDate ? new Date(currentUser.lastActiveDate) : null

        // If we have a last active date, checking if it was "yesterday"
        if (lastActiveStr) {
          // Create date objects relative to arbitrary time to compare "days"
          const d1 = new Date(todayStr)
          const d2 = new Date(lastActiveStr)
          // Diff in milliseconds
          const diffTime = Math.abs(d1.getTime() - d2.getTime())
          diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            newStreak += 1
          } else {
            // Broken streak Logic
            // Check for Streak Freezes
            if (currentUser.streakFreezes > 0) {
              // Consume freeze, KEEP streak (do not increment, do not reset)
              // Or typically, does it keep it at current? Yes.
              // We preserve the streak. We do NOT increment it because they missed a day.
              // We check if it is worth incrementing? No, they missed yesterday.
              // So we just update lastActiveDate to today, consume freeze, and maybe keep streak same?
              // Actually, if I play TODAY, and I missed YESTERDAY, and I have a freeze:
              // The freeze covers YESTERDAY. So my streak should implicitly continue?
              // Commonly: Streak is preserved (e.g. 5 days), freeze used. 
              // If I play today, does it become 6?
              // If the freeze "filled" the gap, yes.
              // Let's go with: Consume freeze, decrement freezes, INCREMENT streak (as if gap was filled).
              // OR: Consume freeze, Keep streak same. This is safer/simpler to explain. "Freeze saved your streak".

              // Decision: Consume freeze, Preserve Streak (no increment or reset). 
              // Wait, if I play today, I should get credit for today?
              // But I missed yesterday.
              // Let's Keep Streak AS IS (saved), and since I played today, I start a new day?
              // If I have 10 days. Missed yesterday. Have freeze.
              // Play today.
              // Result: 10 days. (Freeze saved the 10). +1 for today? = 11?
              // If we assume the freeze "retroactively" filled yesterday, then yes +1.
              // Let's implement: Decrement Freeze, Keep Streak same? 
              // Actually, simplest: newStreak = currentUser.streak (Saved!) 
              // But we want to reward today's activity?
              // Let's just reset to 1 if no freeze, or Keep if freeze.

              // Update: Complication - we are checking `diffDays`. If diff is 2 days (missed 1 day), we can use freeze.
              // If diff is 30 days, we shouldn't use 29 freezes :D
              // Let's only use freeze if diffDays == 2 (missed exactly one day).

              if (diffDays === 2) {
                newStreak = currentUser.streak + 1 // You kept it alive!
                // We need to decrement streakFreezes in the update below
              } else {
                newStreak = 1 // Too many days missed or no freezes?
                // Wait, we need to check if we have enough freezes?
                // Let's simplify: Streak Freezer only saves you if you miss ONE day usually.
              }
            } else {
              newStreak = 1 // Broken streak
            }
          }
        } else {
          newStreak = 1 // First ever activity
        }

        // Update User
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            streak: newStreak,
            lastActiveDate: new Date(),
            streakFreezes: (newStreak > 1 && diffDays === 2 && currentUser.streakFreezes > 0)
              ? { decrement: 1 }
              : undefined,
            totalXP: xpEarned > 0 ? { increment: xpEarned } : undefined
          }
        })
      } else {
        // Same day, just update XP if needed
        if (xpEarned > 0) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              totalXP: { increment: xpEarned }
            }
          })
        }
      }
    }

    if (xpEarned > 0 || (currentUser && currentUser.streak > 0)) { // Re-check badges if streak might have changed
      const badgeResult = await checkBadges(session.user.id)
      newBadges = badgeResult.newBadges
    }

    // Log Activity
    const activityId = (attempt.metadata as any)?.activityId

    await logActivity(
      session.user.id,
      'QUIZ_COMPLETED',
      {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: totalScore,
        maxScore,
        xpEarned
      },
      'COMPLETED',
      activityId
    )

    if (newBadges.length > 0) {
      for (const badge of newBadges) {
        await logActivity(session.user.id, 'BADGE_EARNED', {
          badgeId: badge.id,
          badgeTitle: badge.title
        })
      }
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



