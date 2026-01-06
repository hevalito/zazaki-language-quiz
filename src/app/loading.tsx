
export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 space-y-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
    )
}
