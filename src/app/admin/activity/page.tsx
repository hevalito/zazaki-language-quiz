import { AdminPage, AdminPageContent, AdminPageHeader } from '@/components/admin/page-layout'
import { ActivityFeed } from '@/components/admin/activity-feed'

export const metadata = {
    title: 'User Activity | Admin Dashboard',
}

export default function ActivityPage() {
    return (
        <AdminPage>
            <AdminPageHeader
                title="User Activity Stream"
                description="Real-time feed of all user actions including quizzes, learning practice, and achievements."
            />
            <AdminPageContent>
                <ActivityFeed />
            </AdminPageContent>
        </AdminPage>
    )
}
