'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export function UserNavToggle() {
    const { data: session } = useSession()

    // Fallback initials
    const user = session?.user
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || '??'

    return (
        <>
            {/* Mobile View: Settings Cog */}
            <div className="md:hidden">
                <Link
                    href="/settings"
                    className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors block"
                    aria-label="Einstellungen"
                >
                    <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
                </Link>
            </div>

            {/* Desktop View: User Avatar / Profile Link */}
            <div className="hidden md:block">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                >
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-gray-900 leading-none">
                            {user?.name || 'Benutzer'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Profil anzeigen
                        </p>
                    </div>

                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary-100 border border-primary-200 group-hover:border-primary-300 transition-colors flex items-center justify-center">
                        {user?.image ? (
                            // Using standard img tag fallback if Next/Image behaves oddly with external auth providers, 
                            // but Next/Image is preferred if configured. We'll stick to a robust simpler approach first.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold text-primary-700">
                                {initials}
                            </span>
                        )}
                    </div>
                </Link>
            </div>
        </>
    )
}
