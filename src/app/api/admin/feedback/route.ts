import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import FeedbackReplyEmail from '@/components/emails/feedback-reply-email'



export async function GET(req: Request) {
    try {
        const session = await auth()

        // Check for admin permissions (simple email check based on layout.tsx or proper role)
        const isAdmin = session?.user?.email === 'heval@me.com' || (session?.user as any)?.isAdmin

        if (!isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const type = searchParams.get('type')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where = {
            ...(status && status !== 'ALL' ? { status: status as any } : {}),
            ...(type && type !== 'ALL' ? { type: type as any } : {}),
        }

        const [items, total] = await Promise.all([
            prisma.feedback.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            nickname: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.feedback.count({ where })
        ])

        return NextResponse.json({
            items,
            total,
            pages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Admin feedback fetch error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

const updateSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED']).optional(),
    adminResponse: z.string().optional(),
})

export async function PATCH(req: Request) {
    try {
        const session = await auth()

        // Check for admin permissions
        const isAdmin = session?.user?.email === 'heval@me.com' || (session?.user as any)?.isAdmin

        if (!isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return new NextResponse('Missing ID', { status: 400 })
        }

        const body = await req.json()
        const { status, adminResponse } = updateSchema.parse(body)

        const feedback = await prisma.feedback.findUnique({
            where: { id },
            include: { user: true }
        })

        if (!feedback) {
            return new NextResponse('Feedback not found', { status: 404 })
        }

        // Update the feedback
        const updatedFeedback = await prisma.feedback.update({
            where: { id },
            data: {
                ...(status ? { status } : {}),
                ...(adminResponse ? {
                    adminResponse,
                    respondedAt: new Date(),
                    // Auto-resolve if responding, unless specifically setting another status
                    status: status || 'RESOLVED'
                } : {})
            }
        })

        // Send email if there's a response
        if (adminResponse) {
            const recipientEmail = feedback.user?.email || feedback.userEmail

            if (recipientEmail && process.env.AUTH_RESEND_KEY) {
                try {
                    const resend = new Resend(process.env.AUTH_RESEND_KEY)
                    await resend.emails.send({
                        from: 'Zazaki Quiz <no-reply@zazakiacademy.com>', // Or support@...
                        to: recipientEmail,
                        subject: 'Antwort auf dein Feedback - Zazaki Quiz',
                        react: FeedbackReplyEmail({
                            userFirstname: feedback.user?.name?.split(' ')[0] || feedback.user?.nickname || 'Besucher',
                            feedbackMessage: feedback.message,
                            adminResponse: adminResponse,
                        }),
                    })
                } catch (emailError) {
                    console.error('Failed to send feedback reply email:', emailError)
                    // Don't fail the request, just log it
                }
            } else if (!process.env.AUTH_RESEND_KEY) {
                console.warn('AUTH_RESEND_KEY missing, skipping feedback reply email')
            }
        }

        return NextResponse.json(updatedFeedback)
    } catch (error) {
        console.error('Admin feedback update error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
