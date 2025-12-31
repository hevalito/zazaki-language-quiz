import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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
        isAdmin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate today's XP from attempts
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const todayAttempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: startOfDay
        }
      },
      select: {
        score: true
      }
    })

    const todayXP = todayAttempts.reduce((sum, attempt) => sum + attempt.score, 0)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        streak: user.streak || 0,
        totalXP: user.totalXP || 0,
        dailyGoal: user.dailyGoal || 50,
        todayXP,
        isAdmin: user.isAdmin || false
      }
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
