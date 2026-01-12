
import { prisma } from '@/lib/prisma'
import { BadgeForm } from '@/components/admin/badge-form'
import { notFound } from 'next/navigation'

export default async function EditBadgePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const badge = await prisma.badge.findUnique({
        where: { id: params.id }
    })

    if (!badge) notFound()

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Badge</h1>
            <BadgeForm initialData={badge} isEditing />
        </div>
    )
}
