
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

    const userName = userBadge.user.firstName || userBadge.user.nickname || 'Ein Nutzer'
    const badgeTitle = (userBadge.badge.title as any)?.de || (userBadge.badge.title as any)?.en || 'Erfolg'

    return {
        title: `${userName} hat "${badgeTitle}" freigeschaltet! | Zazakî Quiz`,
        description: `Schau dir den Erfolg von ${userName} an und lerne auch Zazakî!`,
    }
}

export default async function SharedAchievementPage({ params }: Props) {
    const { id } = await params

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

    const displayName = user.firstName || user.nickname || 'Namenloser Lerner'
    const userInitial = displayName.charAt(0).toUpperCase()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Nav */}
            <header className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between max-w-lg">
                    <div className="font-serif font-bold text-xl text-brand-orange">
                        Zazakî Quiz
                    </div>
                    <Link
                        href="/"
                        className="text-sm font-medium bg-brand-orange text-white px-4 py-2 rounded-full shadow-sm hover:bg-orange-600 transition-colors"
                    >
                        App Öffnen
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-lg">

                {/* User Profile Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md relative mb-4">
                        {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.avatarUrl}
                                alt={displayName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-400">{userInitial}</span>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                            Lvl {user.currentLevel}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {displayName}
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                        lernt fleißig Zazakî
                    </p>

                    <div className="flex justify-center gap-4 text-sm text-gray-600 bg-gray-50 py-3 px-4 rounded-xl mx-auto w-fit">
                        <div className="flex items-center gap-1.5">
                            <SparklesIcon className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-gray-900">{user.totalXP}</span> XP
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🔥</span>
                            <span className="font-bold text-gray-900">{user.streak}</span> Tage
                        </div>
                    </div>
                </div>

                {/* Achievement Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-brand-orange/20 relative mb-12">
                    <div className="h-32 relative bg-gradient-to-br from-brand-orange to-red-500">
                        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
                        <div className="absolute bottom-3 left-0 right-0 text-center text-white/90 text-sm font-medium tracking-wide uppercase">
                            Neuer Erfolg Freigeschaltet
                        </div>
                    </div>

                    <div className="px-6 pb-8 relative">
                        {/* Huge floating Icon */}
                        <div className="w-32 h-32 mx-auto -mt-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden bg-orange-50 mb-4 transform hover:scale-105 transition-transform duration-300">
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
                            <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">
                                {getTitle(badge.title)}
                            </h1>
                            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                {getDescription(badge.description)}
                            </p>

                            <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
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
                            className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 inline-block w-full sm:w-auto"
                        >
                            Jetzt kostenlos starten
                        </Link>

                        <div className="mt-4 text-xs text-gray-500">
                            Bereits ein Konto? <Link href="/auth/signin" className="text-white hover:underline">Anmelden</Link>
                        </div>
                    </div>
                </div>

            </main>

            <footer className="py-6 text-center text-gray-400 text-xs">
                &copy; 2024 Zazakî Quiz. All rights reserved.
            </footer>
        </div>
    )
}
