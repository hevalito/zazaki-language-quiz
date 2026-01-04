import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getBerlinWeekStart } from '@/lib/date-utils'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            // Leaderboard can be public or private, currently requiring auth
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const timeFrame = searchParams.get('timeFrame') || 'weekly' // 'weekly' or 'all_time'

        let leaderboardData = []

        if (timeFrame === 'all_time') {
            // Simple TotalXP sort
            const users = await prisma.user.findMany({
                take: 50,
                orderBy: { totalXP: 'desc' },
                select: {
                    id: true,
                    name: true,
                    nickname: true,
                    image: true,
                    totalXP: true,
                    // We can add level/badges later
                }
            })

            leaderboardData = users.map((u, index) => ({
                rank: index + 1,
                id: u.id,
                name: u.nickname || u.name || 'Anonymous',
                image: u.image,
                xp: u.totalXP,
                isCurrentUser: u.id === session?.user?.id
            }))

        } else {
            // Weekly XP Calculation
            // Start of current week (Monday) in Berlin Time
            const startOfWeek = getBerlinWeekStart(new Date())

            // Aggregate XP from Attempts since startOfWeek
            // Group by userId, Sum xpEarned
            const weeklyStats = await prisma.attempt.groupBy({
                by: ['userId'],
                where: {
                    completedAt: {
                        gte: startOfWeek
                    }
                },
                _sum: {
                    xpEarned: true
                },
                orderBy: {
                    _sum: {
                        xpEarned: 'desc'
                    }
                },
                take: 50
            })

            // We need to fetch user details for these IDs
            const userIds = weeklyStats.map(stat => stat.userId)
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: {
                    id: true,
                    name: true,
                    nickname: true,
                    image: true
                }
            })

            // Join data
            leaderboardData = weeklyStats.map((stat, index) => {
                const user = users.find(u => u.id === stat.userId)
                return {
                    rank: index + 1,
                    id: stat.userId,
                    name: user?.nickname || user?.name || 'Anonymous',
                    image: user?.image,
                    xp: stat._sum.xpEarned || 0,
                    isCurrentUser: stat.userId === session?.user?.id
                }
            })
        }

        return NextResponse.json({
            timeFrame,
            leaderboard: leaderboardData
        })

    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
