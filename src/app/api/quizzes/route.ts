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
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status') // 'completed', 'in_progress', 'not_started'

    const quizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        lesson: {
          chapter: {
            courseId: courseId || undefined
          }
        }
      },
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
                    title: true,
                    level: true
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
            completedAt: 'desc'
          },
          take: 1,
          select: {
            score: true,
            completedAt: true,
            maxScore: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    // enrich and filter by status in memory since we can't easily filter by "absence of attempt" in prisma where clause efficiently without raw query or separate fetch
    const enrichedQuizzes = quizzes.map(quiz => {
      const bestAttempt = quiz.attempts[0]
      const isCompleted = !!bestAttempt?.completedAt
      const inProgress = false // For now, we only track completed or not. Future: check unfinished attempts.

      return {
        ...quiz,
        status: isCompleted ? 'completed' : 'not_started',
        lastScore: bestAttempt?.score || 0,
        maxScore: bestAttempt?.maxScore || 0
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
