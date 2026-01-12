
import { BadgeForm } from '@/components/admin/badge-form'

export default function NewBadgePage() {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Badge</h1>
            <BadgeForm />
        </div>
    )
}
