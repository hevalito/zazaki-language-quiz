import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getAllOneoffSettings } from '@/app/actions/system-settings'
import { PushBroadcastContent } from './push-content'
import { AdminPage, AdminPageHeader, AdminPageContent } from '@/components/admin/page-layout'

export const dynamic = 'force-dynamic';

export default async function AdminPushPage() {
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

    // Fetch current settings for the settings tab
    const settings = await getAllOneoffSettings()

    return (
        <AdminPage>
            <AdminPageHeader title="Push Broadcast" />
            <AdminPageContent>
                <PushBroadcastContent initialSettings={settings} />
            </AdminPageContent>
        </AdminPage>
    )
}
