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
                    completedAt: new Date().toISOString(),
                    resultEmailPending: true // Flag to send email on login
                }
            },
            create: {
                email,
                courseFinderData: {
                    result,
                    history,
                    completedAt: new Date().toISOString(),
                    resultEmailPending: true // Flag to send email on login
                },
                // Set default fields for new users
                dailyGoal: 100,
                preferredScript: 'LATIN'
            }
        })

        // NOTE: Result email is now sent in auth.ts signIn callback
        // after the user clicks the magic link.

        return NextResponse.json({ success: true })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[COURSE_FINDER_GUEST_SAVE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
