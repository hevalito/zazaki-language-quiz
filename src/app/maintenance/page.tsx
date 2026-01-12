import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        Under Maintenance
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        We are currently updating the platform to make it even better.
                        Please check back in a few minutes.
                    </p>
                </div>
            </div>
        </div>
    );
}
