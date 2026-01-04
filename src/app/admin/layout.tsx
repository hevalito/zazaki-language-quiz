import { requireAdmin } from '@/lib/admin-auth'
import AdminLayoutShell from '@/components/admin/layout-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  )
}
