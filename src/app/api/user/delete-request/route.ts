import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import DeleteAccountEmail from '@/components/emails/delete-account-email'
import crypto from 'crypto'
import { addHours } from 'date-fns'

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user || !user.email) {
            return NextResponse.json({ error: 'User not found or no email' }, { status: 404 })
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = addHours(new Date(), 1)

        // Save token to user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                deletionToken: token,
                deletionTokenExpires: expiresAt
            }
        })

        // Send email
        const confirmUrl = `${process.env.NEXTAUTH_URL}/auth/delete-confirm?token=${token}`

        await resend.emails.send({
            from: 'Zazakî Quiz <noreply@zazakiacademy.com>',
            to: user.email,
            subject: 'Bestätige die Löschung deines Kontos',
            react: DeleteAccountEmail({
                confirmUrl,
                userName: user.name || user.firstName || 'Nutzer'
            })
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete Request Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
