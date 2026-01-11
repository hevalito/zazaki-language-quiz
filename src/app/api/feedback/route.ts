import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for feedback submission
const feedbackSchema = z.object({
    type: z.enum(['BUG', 'FEATURE', 'SUPPORT', 'OTHER']),
    message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
    pageUrl: z.string().optional(),
    deviceInfo: z.record(z.string(), z.any()).optional(),
    userEmail: z.string().email().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        const body = await req.json()

        const validatedData = feedbackSchema.parse(body)

        // Ensure we have either a user session OR an email
        if (!session?.user && !validatedData.userEmail) {
            return new NextResponse('Email is required for guest feedback', { status: 400 })
        }

        const feedback = await prisma.feedback.create({
            data: {
                type: validatedData.type,
                message: validatedData.message,
                pageUrl: validatedData.pageUrl,
                deviceInfo: validatedData.deviceInfo ?? {},
                status: 'OPEN',
                // Connect to user if session exists
                ...(session?.user?.id ? {
                    user: {
                        connect: { id: session.user.id }
                    }
                } : {
                    // Otherwise store the provided email
                    userEmail: validatedData.userEmail
                })
            }
        })

        return NextResponse.json(feedback)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        console.error('Feedback submission error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
