
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

const DEFAULT_BADGES = [
    {
        code: 'first_step',
        title: { en: 'First Step', de: 'Erster Schritt' },
        description: { en: 'Complete your first lesson', de: 'Schließe deine erste Lektion ab' },
        conditionLabel: { en: 'Complete 1 Lesson', de: '1 Lektion abschließen' },
        iconUrl: '🎯',
        criteria: { type: 'lesson_completion', count: 1 },
        sortOrder: 1
    },
    {
        code: 'streak_3',
        title: { en: '3-Day Streak', de: '3-Tage-Serie' },
        description: { en: 'Learn for 3 consecutive days', de: 'Lerne 3 Tage in Folge' },
        conditionLabel: { en: '3 Day Streak', de: '3 Tage Streak' },
        iconUrl: '🔥',
        criteria: { type: 'streak', count: 3 },
        sortOrder: 2
    },
    {
        code: 'streak_7',
        title: { en: 'Week Warrior', de: 'Wochen-Krieger' },
        description: { en: 'Learn for 7 consecutive days', de: 'Lerne 7 Tage in Folge' },
        conditionLabel: { en: '7 Day Streak', de: '7 Tage Streak' },
        iconUrl: '⚡',
        criteria: { type: 'streak', count: 7 },
        sortOrder: 3
    },
    {
        code: 'streak_30',
        title: { en: 'Monthly Master', de: 'Monats-Meister' },
        description: { en: 'Learn for 30 consecutive days', de: 'Lerne 30 Tage in Folge' },
        conditionLabel: { en: '30 Day Streak', de: '30 Tage Streak' },
        iconUrl: '📅',
        criteria: { type: 'streak', count: 30 },
        sortOrder: 4
    },
    {
        code: 'xp_100',
        title: { en: 'Century Club', de: 'Hunderter Club' },
        description: { en: 'Earn 100 total XP', de: 'Sammle 100 XP' },
        conditionLabel: { en: 'Earn 100 XP', de: '100 XP sammeln' },
        iconUrl: '🌟',
        criteria: { type: 'total_xp', count: 100 },
        sortOrder: 5
    },
    {
        code: 'xp_500',
        title: { en: 'High Fiver', de: 'High Fiver' },
        description: { en: 'Earn 500 total XP', de: 'Sammle 500 XP' },
        conditionLabel: { en: 'Earn 500 XP', de: '500 XP sammeln' },
        iconUrl: '💎',
        criteria: { type: 'total_xp', count: 500 },
        sortOrder: 6
    },
    {
        code: 'xp_1000',
        title: { en: 'Kilo King', de: 'Kilo-König' },
        description: { en: 'Earn 1000 total XP', de: 'Sammle 1000 XP' },
        conditionLabel: { en: 'Earn 1000 XP', de: '1000 XP sammeln' },
        iconUrl: '👑',
        criteria: { type: 'total_xp', count: 1000 },
        sortOrder: 7
    },
    {
        code: 'level_5',
        title: { en: 'Level 5', de: 'Level 5' },
        description: { en: 'Reach Level 5', de: 'Erreiche Level 5' },
        conditionLabel: { en: 'Reach Level 5', de: 'Level 5 erreichen' },
        iconUrl: '🎓',
        criteria: { type: 'level_reached', count: 5 },
        sortOrder: 8
    }
]

export async function POST(request: Request) {
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const results = {
            created: 0,
            updated: 0,
            errors: 0
        }

        for (const badge of DEFAULT_BADGES) {
            try {
                const existing = await prisma.badge.findUnique({
                    where: { code: badge.code }
                })

                if (existing) {
                    await prisma.badge.update({
                        where: { code: badge.code },
                        data: {
                            // Only update fields that might be missing or out of sync
                            title: badge.title,
                            description: badge.description,
                            conditionLabel: badge.conditionLabel,
                            criteria: badge.criteria,
                            iconUrl: existing.iconUrl || badge.iconUrl, // Don't overwrite if they set a custom one
                            sortOrder: badge.sortOrder
                        }
                    })
                    results.updated++
                } else {
                    await prisma.badge.create({
                        data: {
                            ...badge,
                            isActive: true
                        }
                    })
                    results.created++
                }
            } catch (e) {
                console.error(`Error processing badge ${badge.code}`, e)
                results.errors++
            }
        }

        return NextResponse.json({ message: 'Restore completed', results })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
