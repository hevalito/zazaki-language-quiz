import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { SETTINGS_CACHE_TAG } from '@/lib/settings'

// Helper to check admin status
async function isAdmin() {
    const session = await auth()
    if (!session?.user?.id) return false

    // Quick check or full DB check depending on session strategy. 
    // Secure approach: DB check
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })
    return user?.isAdmin === true
}

export async function GET() {
    if (!await isAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const settings = await prisma.systemSetting.findMany()
        // Convert array to object for easier frontend consumption: { key: value }
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {} as Record<string, any>)

        return NextResponse.json(settingsMap)
    } catch (error) {
        console.error('Failed to fetch settings:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(req: Request) {
    if (!await isAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const body = await req.json()
        const updates = Object.entries(body)

        // Use transaction to ensure all updates succeed or fail together
        await prisma.$transaction(
            updates.map(([key, value]) =>
                prisma.systemSetting.upsert({
                    where: { key },
                    update: { value: value as any },
                    create: { key, value: value as any }
                })
            )
        )

        revalidateTag(SETTINGS_CACHE_TAG)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update settings:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
