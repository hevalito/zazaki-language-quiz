import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getAllOneoffSettings } from '@/app/actions/system-settings'
import { NotificationSettingsForm } from './notification-settings-form'

export default async function NotificationSettingsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/api/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user?.isAdmin) {
        redirect('/')
    }

    // Fetch current settings
    const settings = await getAllOneoffSettings()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
                <p className="text-muted-foreground">
                    Manage automated push notification triggers and templates.
                </p>
            </div>

            <NotificationSettingsForm initialSettings={settings} />
        </div>
    )
}
