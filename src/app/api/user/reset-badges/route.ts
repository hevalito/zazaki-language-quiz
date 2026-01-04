import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete all badges for this user
        await prisma.userBadge.deleteMany({
            where: { userId: session.user.id }
        })

        // Also reset totalXP if desired? 
        // User only asked to reset achievements to see the celebration again.
        // We will keep XP for now to not be too destructive, unless they want full progress reset.
        // Let's just do badges for the "Treasure Crate" test.

        return NextResponse.json({ success: true, message: 'Achievements have been reset.' })
    } catch (error) {
        console.error('Error resetting badges:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
