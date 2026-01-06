import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!currentUser?.isAdmin) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get('q')

        const users = await prisma.user.findMany({
            where: query ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { nickname: { contains: query, mode: 'insensitive' } },
                ]
            } : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true,
                isAdmin: true,
                nickname: true,
                createdAt: true,
                lastActiveDate: true,
                totalXP: true,
                currentLevel: true,
                dailyGoal: true,
                courseFinderData: true,
                _count: {
                    select: { pushSubscriptions: true }
                }
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('[ADMIN_USERS_GET]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
