import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import GoodbyeEmail from '@/components/emails/goodbye-email'

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export async function POST(req: Request) {
    try {
        const { token } = await req.json()

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { deletionToken: token }
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
        }

        if (!user.deletionTokenExpires || user.deletionTokenExpires < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 })
        }

        const userEmail = user.email
        const userName = user.name || user.firstName || 'Nutzer'

        // Delete User (Cascades due to Schema)
        await prisma.user.delete({
            where: { id: user.id }
        })

        // Send Goodbye Email
        if (userEmail) {
            await resend.emails.send({
                from: 'Zazaki Quiz <noreply@zazakiacademy.com>',
                to: userEmail,
                subject: 'Auf Wiedersehen - Zazaki Quiz',
                react: GoodbyeEmail({ userName })
            })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete Confirm Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
