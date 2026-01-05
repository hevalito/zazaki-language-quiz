import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import CourseFinderResultEmail from "@/components/emails/course-finder-result-email"

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, result, history } = body

        if (!email || !result) {
            return new NextResponse("Missing email or result", { status: 400 })
        }

        // 1. Upsert User
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                courseFinderData: {
                    result,
                    history,
                    completedAt: new Date().toISOString()
                }
            },
            create: {
                email,
                courseFinderData: {
                    result,
                    history,
                    completedAt: new Date().toISOString()
                },
                // Set default fields for new users
                dailyGoal: 100,
                preferredScript: 'LATIN'
            }
        })

        // 2. Send Result Email
        const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`

        await resend.emails.send({
            from: "Zazakî Academy <updates@zazakiacademy.com>",
            to: email,
            subject: `Dein Zazakî-Kurs Ergebnis: ${result.recommendation}`,
            react: CourseFinderResultEmail({
                name: user.firstName || user.name || 'Heval',
                dialect: result.dialect,
                recommendation: result.recommendation,
                dashboardUrl,
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[COURSE_FINDER_GUEST_SAVE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
