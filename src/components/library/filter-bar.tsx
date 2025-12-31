
interface FilterBarProps {
    currentLevel: string
    currentStatus: string
    onLevelChange: (level: string) => void
    onStatusChange: (status: string) => void
}

export function FilterBar({
    currentLevel,
    currentStatus,
    onLevelChange,
    onStatusChange
}: FilterBarProps) {

    const levels = [
        { id: '', label: 'Alle Level' },
        { id: 'A0', label: 'A0' },
        { id: 'A1', label: 'A1' },
        { id: 'A2', label: 'A2' },
        { id: 'B1', label: 'B1' },
    ]

    const statuses = [
        { id: '', label: 'Alle' },
        { id: 'not_started', label: 'Neu' },
        { id: 'completed', label: 'Abgeschlossen' },
    ]

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Level:</span>
                <div className="flex gap-2">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => onLevelChange(level.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${currentLevel === level.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {level.label}
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
