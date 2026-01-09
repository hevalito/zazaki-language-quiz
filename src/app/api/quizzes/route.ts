import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') // A0, A1, etc.
    const status = searchParams.get('status') // 'completed', 'in_progress', 'not_started'
    const type = searchParams.get('type')
    const courseId = searchParams.get('courseId')

    const where: any = {
      isPublished: true
    }

    let orderBy: any = { order: 'asc' }

    if (type === 'DAILY') {
      where.type = 'DAILY'
      orderBy = { date: 'desc' }
    } else {
      // Standard quizzes must have a lesson/course context
      where.lesson = {
        chapter: {
          course: {
            level: level ? (level as any) : undefined,
            id: courseId ? courseId : undefined
          }
        }
      }
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        lesson: {
          select: {
            title: true,
            targetSkills: true,
            chapter: {
              select: {
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    level: true,
                    dialectCode: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            questions: true
          }
        },
        attempts: {
          where: {
            userId: session.user.id
          },
          orderBy: {
            startedAt: 'desc'
          },
          select: {
            id: true,
            score: true,
            completedAt: true,
            maxScore: true
          }
        }
      },
      orderBy
    })

    // enrich and filter by status in memory since we can't easily filter by "absence of attempt" in prisma where clause efficiently without raw query or separate fetch
    const enrichedQuizzes = quizzes.map(quiz => {
      const attempts = quiz.attempts
      const isCompleted = attempts.some(a => !!a.completedAt)
      const lastAttempt = attempts[0] // Most recently started
      const bestAttempt = attempts.reduce((best, current) => (current.score > (best?.score || 0) ? current : best), attempts[0])

      return {
        ...quiz,
        status: isCompleted ? 'completed' : 'not_started',
        lastScore: lastAttempt?.score || 0,
        maxScore: bestAttempt?.maxScore || lastAttempt?.maxScore || 0, // Should this be from the attempt or the quiz? The attempt stores snapshot.
        // Actually, if I want to show "Best Score", I should use bestAttempt.score
        bestScore: bestAttempt?.score || 0
      }
    })

    let filteredQuizzes = enrichedQuizzes

    if (status) {
      if (status === 'completed') {
        filteredQuizzes = enrichedQuizzes.filter(q => q.status === 'completed')
      } else if (status === 'not_started') {
        filteredQuizzes = enrichedQuizzes.filter(q => q.status === 'not_started')
      }
    }

    return NextResponse.json(filteredQuizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
