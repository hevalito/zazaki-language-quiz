
interface FilterBarProps {
    currentCourseId: string
    currentStatus: string
    onCourseChange: (courseId: string) => void
    onStatusChange: (status: string) => void
}

import { useEffect, useState } from 'react'

export function FilterBar({
    currentCourseId,
    currentStatus,
    onCourseChange,
    onStatusChange
}: FilterBarProps) {
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses')
                if (res.ok) {
                    const data = await res.json()
                    setCourses(data)
                }
            } catch (error) {
                console.error('Failed to fetch courses filters', error)
            }
        }
        fetchCourses()
    }, [])

    const statuses = [
        { id: '', label: 'Alle' },
        { id: 'not_started', label: 'Neu' },
        { id: 'completed', label: 'Abgeschlossen' },
    ]

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Kategorie:</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => onCourseChange('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${currentCourseId === ''
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Alle
                    </button>
                    {courses.map((course) => (
                        <button
                            key={course.id}
                            onClick={() => onCourseChange(course.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${currentCourseId === course.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {course.title?.de || course.title?.en}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Status:</span>
                <div className="flex gap-2">
                    {statuses.map((status) => (
                        <button
                            key={status.id}
                            onClick={() => onStatusChange(status.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${currentStatus === status.id
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
