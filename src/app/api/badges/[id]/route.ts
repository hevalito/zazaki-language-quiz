import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await auth()
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const badge = await prisma.badge.findUnique({
            where: { id: params.id },
            include: {
                userBadges: {
                    where: { userId: session.user.id }
                }
            }
        })

        if (!badge) {
            return new NextResponse("Badge not found", { status: 404 })
        }

        // Check if user has it
        const userHasBadge = badge.userBadges.length > 0

        return NextResponse.json({
            ...badge,
            isEarned: userHasBadge,
            earnedAt: userHasBadge ? badge.userBadges[0].earnedAt : null
        })

    } catch (error) {
        console.error("[BADGE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
