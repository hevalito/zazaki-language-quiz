import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const onboardingSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    nickname: z.string().min(2)
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { firstName, lastName, nickname } = onboardingSchema.parse(body)

        // Check if nickname is taken (optional, but good practice)
        const existingNick = await prisma.user.findFirst({
            where: {
                nickname: { equals: nickname, mode: 'insensitive' },
                NOT: { id: session.user.id }
            }
        })

        if (existingNick) {
            return new NextResponse('Nickname already taken', { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName,
                lastName,
                nickname,
                // Optional: Mark onboarding as complete if you have a flag, 
                // or we infer it from the presence of these fields.
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse('Invalid data', { status: 400 })
        }
        console.error('Onboarding error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
