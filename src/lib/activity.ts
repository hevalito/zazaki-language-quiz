import { prisma } from '@/lib/prisma'
import { ActivityType, ActivityStatus } from '@prisma/client'

export async function logActivity(
    userId: string,
    type: ActivityType,
    metadata: any = null,
    status: ActivityStatus = 'COMPLETED',
    activityId?: string
) {
    try {
        if (activityId) {
            return await prisma.activity.update({
                where: { id: activityId },
                data: {
                    type,
                    status,
                    metadata: metadata ?? undefined // Update metadata only if provided
                }
            })
        }

        return await prisma.activity.create({
            data: {
                userId,
                type,
                metadata,
                status
            }
        })
    } catch (error) {
        console.error('Failed to log activity:', error)
        // Ensure activity logging failures don't block the main flow
        return null
    }
}
