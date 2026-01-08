import { prisma } from '@/lib/prisma'
import { ActivityType } from '@prisma/client'

export async function logActivity(
    userId: string,
    type: ActivityType,
    metadata: any = null
) {
    try {
        await prisma.activity.create({
            data: {
                userId,
                type,
                metadata
            }
        })
    } catch (error) {
        console.error('Failed to log activity:', error)
        // Ensure activity logging failures don't block the main flow
    }
}
