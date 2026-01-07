import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon, TrophyIcon, CalendarDaysIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyIconSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import { ShareBadgeButton } from '@/components/achievements/share-badge-button'

interface Props {
    params: Promise<{ id: string }>
}

export default async function AchievementDetailPage(props: Props) {
    const params = await props.params;
    const session = await auth()

    if (!session?.user) {
        redirect('/api/auth/signin')
    }

    const badge = await prisma.badge.findUnique({
        where: { id: params.id },
        include: {
            userBadges: {
                where: { userId: session.user.id }
            }
        }
    })

    if (!badge) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Erfolg nicht gefunden.</p>
            </div>
        )
    }

    const isEarned = badge.userBadges.length > 0
    const earnedAt = isEarned ? badge.userBadges[0].earnedAt : null

    // Helper for translations
    const getTitle = (t: any) => t?.de || t?.en || 'Erfolg'
    const getDescription = (t: any) => t?.de || t?.en || ''
    const getConditionLabel = (t: any) => t?.de || t?.en || ''

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 safe-area-top">
                <div className="container mx-auto px-4 py-4 flex items-center">
                    <Link href="/achievements" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 font-serif">Erfolg-Details</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-lg">
                <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border ${isEarned ? 'border-brand-orange/20' : 'border-gray-200'}`}>

                    {/* Banner / Header */}
                    <div className={`h-32 relative ${isEarned ? 'bg-gradient-to-br from-brand-orange to-red-500' : 'bg-gray-200'}`}>
                        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
                    </div>

                    <div className="px-6 pb-8 relative">
                        {/* Icon Badge */}
                        <div className={`w-36 h-36 mx-auto -mt-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden ${isEarned ? 'bg-orange-50' : 'bg-gray-100'}`}>
                            {badge.imageUrl ? (
                                <div className={`relative w-full h-full ${!isEarned ? 'grayscale brightness-75 contrast-125' : ''}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={badge.imageUrl}
                                        alt={getTitle(badge.title)}
                                        className={`w-full h-full object-cover ${!isEarned ? 'blur-[2px] scale-105' : ''}`}
                                    />
                                    {!isEarned && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10">
                                            <LockClosedIcon className="w-12 h-12 text-white/90 drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            ) : badge.iconUrl && (badge.iconUrl.startsWith('http') || badge.iconUrl.startsWith('/')) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={badge.iconUrl}
                                    alt={getTitle(badge.title)}
                                    className={`w-20 h-20 object-contain ${!isEarned && 'grayscale opacity-50'}`}
                                />
                            ) : badge.iconUrl ? (
                                <span className={`text-6xl ${!isEarned && 'grayscale opacity-50 filter'}`} role="img" aria-label={getTitle(badge.title)}>
                                    {badge.iconUrl}
                                </span>
                            ) : (
                                isEarned ? (
                                    <TrophyIconSolid className="w-16 h-16 text-brand-orange" />
                                ) : (
                                    <LockClosedIcon className="w-16 h-16 text-gray-400" />
                                )
                            )}
                        </div>

                        <div className="text-center mt-4">
                            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">
                                {getTitle(badge.title)}
                            </h2>

                            {isEarned ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
                                    <TrophyIcon className="w-4 h-4 mr-1" />
                                    Freigeschaltet
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm font-medium mb-4">
                                    <LockClosedIcon className="w-4 h-4 mr-1" />
                                    Gesperrt
                                </div>
                            )}

                            <p className="text-gray-600 leading-relaxed mb-6">
                                {getDescription(badge.description)}
                            </p>

                            {/* Condition Label */}
                            {getConditionLabel(badge.conditionLabel) && (
                                <div className={`mb-8 inline-flex flex-col items-center justify-center min-w-[200px] px-6 py-3 rounded-2xl border ${isEarned ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isEarned ? 'text-orange-600/70' : 'text-gray-400'}`}>
                                        {isEarned ? 'Geschafft' : 'Ziel'}
                                    </span>
                                    <span className={`font-bold text-lg ${isEarned ? 'text-gray-900' : 'text-gray-800'}`}>
                                        {getConditionLabel(badge.conditionLabel)}
                                    </span>
                                </div>
                            )}

                            {isEarned && earnedAt && (
                                <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4 mx-auto w-fit">
                                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-400" />
                                    <span>Erhalten am {earnedAt.toLocaleDateString('de-DE')}</span>
                                </div>
                            )}
                        </div>

                        {/* Progress Visual (Fake for now if not tracked perfectly) */}
                        {!isEarned && (
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-sm font-bold text-gray-900 mb-2">Fortschritt</p>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-gray-300 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Spiele weiter, um diesen Erfolg freizuschalten!</p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Share Button */}
                {isEarned && (
                    <div className="mt-6 text-center">
                        <ShareBadgeButton
                            title={getTitle(badge.title)}
                            description={getDescription(badge.description)}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}
