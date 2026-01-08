'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSystemSetting(key: string, defaultValue: any = null) {
    const setting = await prisma.systemSetting.findUnique({
        where: { key }
    })
    return setting?.value ?? defaultValue
}

export async function updateSystemSetting(key: string, value: any, description?: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user?.isAdmin) {
        throw new Error('Forbidden')
    }

    await prisma.systemSetting.upsert({
        where: { key },
        update: {
            value,
            ...(description && { description })
        },
        create: {
            key,
            value,
            description
        }
    })

    revalidatePath('/admin/settings/notifications')
    return { success: true }
}

export async function getAllOneoffSettings() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: 'push_' } }
    })

    // Transform array to object for easier consumption
    return settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, any>)
}
