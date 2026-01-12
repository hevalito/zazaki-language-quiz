
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TrophyIcon, StarIcon, SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyIconSolid } from '@heroicons/react/24/solid'

interface Props {
    params: Promise<{ id: string }>
}

// Ensure the page is dynamic since we're fetching specific user badge data
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const userBadge = await prisma.userBadge.findUnique({
        where: { id },
        include: {
            user: {
                select: { firstName: true, nickname: true }
            },
            badge: {
                select: { title: true }
            }
        }
    })

    if (!userBadge) {
        return {
            title: 'Erfolg teilen | Zazakî Quiz',
        }
    }

    const userName = userBadge.user.nickname || userBadge.user.firstName || 'Ein Nutzer'
    const badgeTitle = (userBadge.badge.title as any)?.de || (userBadge.badge.title as any)?.en || 'Erfolg'

    return {
        title: `${userName} hat "${badgeTitle}" freigeschaltet! | Zazakî Quiz`,
        description: `Schau dir den Erfolg von ${userName} an und lerne auch Zazakî!`,
    }
}

export default async function SharedAchievementPage({ params }: Props) {
    const { id } = await params

    // Fetch user and badge data
    const userBadge = await prisma.userBadge.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    nickname: true,
                    avatarUrl: true,
                    image: true,
                    currentLevel: true,
                    streak: true,
                    totalXP: true
                }
            },
            badge: true
        }
    })

    if (!userBadge) {
        notFound()
    }

    const { user, badge } = userBadge

    // Helper for translations
    const getTitle = (t: any) => t?.de || t?.en || 'Erfolg'
    const getDescription = (t: any) => t?.de || t?.en || ''

    // Use Nickname as primary name
    const displayName = user.nickname || user.firstName || 'Namenloser Lerner'
    const userInitial = displayName.charAt(0).toUpperCase()

    // Avatar logic: helper to get the best available image
    const avatarSrc = user.avatarUrl || user.image

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors">
            {/* Header / Nav */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 px-4 sticky top-0 z-10 transition-colors">
                <div className="container mx-auto flex items-center justify-between max-w-lg">
                    <div className="relative w-32 h-8">
                        <Image
                            src="/images/logo-full.png"
                            alt="Zazakî Quiz"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                    <Link
                        href="/"
                        style={{ backgroundColor: 'rgb(254 189 17)' }}
                        className="text-sm font-bold text-gray-900 dark:text-gray-900 px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                    >
                        App Öffnen
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-lg">

                {/* User Profile Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-md mb-4 overflow-hidden">
                        {avatarSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={avatarSrc}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-400">{userInitial}</span>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {displayName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        lernt fleißig Zazakî
                    </p>

                    <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3 px-4 rounded-xl mx-auto w-fit">
                        <div className="flex items-center gap-1.5">
                            <SparklesIcon className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-gray-900 dark:text-white">{user.totalXP}</span> XP
                        </div>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🔥</span>
                            <span className="font-bold text-gray-900 dark:text-white">{user.streak}</span> Tage
                        </div>
                    </div>
                </div>

                {/* Achievement Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-brand-orange/20 dark:border-brand-orange/10 relative mb-12">
                    <div className="h-32 relative bg-gradient-to-br from-brand-orange to-red-500">
                        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>

                        {/* Status Pill moved to top-center to not be obscured */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                Neuer Erfolg Freigeschaltet
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-8 relative">
                        {/* Huge floating Icon */}
                        <div className="w-32 h-32 mx-auto -mt-16 rounded-full border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center overflow-hidden bg-orange-50 dark:bg-gray-800 mb-4 transform hover:scale-105 transition-transform duration-300 relative z-10">
                            {badge.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={badge.imageUrl}
                                    alt={getTitle(badge.title)}
                                    className="w-full h-full object-cover"
                                />
                            ) : badge.iconUrl && (badge.iconUrl.startsWith('http') || badge.iconUrl.startsWith('/')) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={badge.iconUrl}
                                    alt={getTitle(badge.title)}
                                    className="w-20 h-20 object-contain"
                                />
                            ) : badge.iconUrl ? (
                                <span className="text-5xl" role="img" aria-label={getTitle(badge.title)}>
                                    {badge.iconUrl}
                                </span>
                            ) : (
                                <TrophyIconSolid className="w-14 h-14 text-brand-orange" />
                            )}
                        </div>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-gray-100 mb-2">
                                {getTitle(badge.title)}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                                {getDescription(badge.description)}
                            </p>

                            <div className="mt-6 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                <span>Erhalten am {userBadge.earnedAt.toLocaleDateString('de-DE')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Promotion / Call to Action */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-orange rounded-full opacity-20 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <StarIcon className="w-6 h-6 text-yellow-400" />
                        </div>

                        <h3 className="text-xl font-bold mb-2">
                            Lerne Zazakî spielerisch!
                        </h3>
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            Tritt {displayName} bei und erreiche deine eigenen Ziele. Kostenlos, interaktiv und effektiv.
                        </p>

                        <Link
                            href="/auth/signup"
                            style={{ backgroundColor: 'rgb(254 189 17)' }}
                            className="text-gray-900 font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 inline-block w-full sm:w-auto hover:opacity-90"
                        >
                            Jetzt kostenlos starten
                        </Link>

                        <div className="mt-4 text-xs text-gray-500">
                            Bereits ein Konto? <Link href="/auth/signin" className="text-white hover:underline">Anmelden</Link>
                        </div>
                    </div>
                </div>

            </main>

            <footer className="py-6 text-center text-gray-400 dark:text-gray-600 text-xs">
                &copy; 2024 Zazakî Quiz. All rights reserved.
            </footer>
        </div>
    )
}
