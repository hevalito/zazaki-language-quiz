import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getBerlinStartOfDay } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        streak: true,
        totalXP: true,
        dailyGoal: true,
        lastActiveDate: true,
        isAdmin: true,
        firstName: true,
        nickname: true,
        currentLevel: true,
        _count: {
          select: {
            attempts: true,
            badges: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate today's XP from attempts (Berlin Time)
    const startOfDay = getBerlinStartOfDay(new Date())

    const todayAttempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: startOfDay
        }
      },
      select: {
        xpEarned: true
      }
    })

    const todayXP = todayAttempts.reduce((sum, attempt) => sum + (attempt.xpEarned || 0), 0)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        streak: user.streak || 0,
        totalXP: user.totalXP || 0,
        dailyGoal: user.dailyGoal || 50,
        todayXP,
        isAdmin: user.isAdmin || false,
        firstName: user.firstName,
        nickname: user.nickname,
        currentLevel: user.currentLevel,
        attemptCount: user._count.attempts,
        achievementCount: user._count.badges
      }
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
