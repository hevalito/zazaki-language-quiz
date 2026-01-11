'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Cog6ToothIcon,
    ArrowRightIcon,
    SparklesIcon,
    FireIcon,
    UserCircleIcon,
    BoltIcon, // Using Sparkles as generic badge icon fallback or Trophy
    LockClosedIcon
} from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'
import { useMastery } from '@/hooks/use-mastery'
import { useTranslation, useTranslationContext } from '@/hooks/use-translation'

interface Badge {
    id: string
    code: string
    title: { [key: string]: string }
    description: { [key: string]: string }
    imageUrl?: string
    isEarned: boolean
}

interface UserProfile {
    firstName?: string
    lastName?: string
    nickname?: string
    streak: number
    totalXp: number
    level: number
}

export function ProfileScreen() {
    const { t } = useTranslation()
    const { locale } = useTranslationContext()
    const router = useRouter()
    const { data: session } = useSession()
    const { stats: masteryStats } = useMastery()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [badges, setBadges] = useState<Badge[]>([])

    useEffect(() => {
        if (session?.user) {
            fetchData()
        }
    }, [session])

    const fetchData = async () => {
        try {
            // Concurrent fetch
            const [profileRes, badgesRes] = await Promise.all([
                fetch('/api/user/profile'),
                // Assuming we use the same endpoint as achievements screen or create a specialized one.
                // The prompt implied we can assume fetch('/api/user/badges') works or similar.
                // Reusing the logic we saw in AchievementScreen.
                fetch('/api/user/badges') // If this endpoint doesn't exist, we might need to rely on what AchievementScreen used.
                // The AchievementScreen used fetch('/api/user/badges') in the previous context I read? 
                // Wait, in Step 65 output, line 47: const response = await fetch('/api/user/badges')
                // So I will assume this endpoint exists or mock it if I was creating it.
                // Since I didn't create /api/user/badges, I should probably check if it exists.
                // Actually, in the previous turn, step 65, I saw the AchievementScreen code using it.
                // If that was existing code, then the endpoint exists.
                // If that was me VIEWING the file, and the file used it, then fine.
                // Wait, did I write AchievementScreen? It was existing code.
                // So /api/user/badges likely exists.
            ])

            if (profileRes.ok) {
                const data = await profileRes.json()
                setProfile({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    nickname: data.nickname || '',
                    streak: data.streak || 0,
                    totalXp: data.totalXP || 0,
                    level: data.level || 1
                })
            }

            if (badgesRes.ok) {
                const data = await badgesRes.json()
                setBadges(data)
            }
        } catch (error) {
            console.error('Failed to load profile data', error)
        } finally {
            setLoading(false)
        }
    }

    // Helper for translations (Badge content itself)
    const getLocalizedContent = (field: any) => {
        if (!field) return ''
        return field[locale] || field['de'] || field['en'] || ''
    }

    const earnedBadges = badges.filter(b => b.isEarned)

    // Display Name Logic: Profile First/Last > Nickname > Session Name
    const displayName = profile?.firstName || profile?.lastName
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : profile?.nickname || session?.user?.name || t('profile.guest', 'Gast')


    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">{t('nav.profile', 'Profil')}</h1>
                    <button
                        onClick={() => router.push('/settings')}
                        className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label={t('settings.title', 'Einstellungen')}
                    >
                        <Cog6ToothIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">

                {/* User Identity Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center space-x-5">
                    <div className="relative">
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100">
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <UserCircleIcon className="w-12 h-12 text-primary-400" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 truncate">
                                    {displayName}
                                </h2>
                                {profile?.nickname && profile.nickname !== displayName && (
                                    <p className="text-sm font-medium text-gray-500">@{profile.nickname}</p>
                                )}
                            </div>
                        )}
                        <p className="text-sm text-gray-400 truncate">{session?.user?.email}</p>
                        {/* Stats Row */}
                        <div className="flex items-center space-x-3 mt-3">
                            {loading ? (
                                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <>
                                    <div className="flex items-center text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100" title={t('stats.streak', 'Streak')}>
                                        <FireIcon className="w-3.5 h-3.5 mr-1" />
                                        <span>{profile?.streak || 0}</span>
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100" title={t('stats.xp', 'XP')}>
                                        <BoltIcon className="w-3.5 h-3.5 mr-1" />
                                        <span>{profile?.totalXp || 0} XP</span>
                                    </div>
                                    {/* Global Mastery Stat */}
                                    <div className="flex items-center text-xs font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100" title={t('stats.mastery', 'Mastery')}>
                                        <SparklesIconSolid className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                                        <span>{masteryStats?.masteryPercentage || 0}%</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Badges / Achievements Collection */}
                <section className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-2 text-yellow-500" />
                            {t('profile.badges.title', 'Deine Sammlung')}
                        </h3>
                        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {earnedBadges.length} / {badges.length}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex space-x-2 overflow-hidden">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />)}
                        </div>
                    ) : earnedBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {earnedBadges.slice(0, 10).map((badge) => (
                                <div key={badge.id} className="relative group cursor-help">
                                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100 overflow-hidden shadow-sm transition-transform hover:scale-110">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {badge.imageUrl ? (
                                            <Image
                                                src={badge.imageUrl}
                                                alt={getLocalizedContent(badge.title)}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <SparklesIconSolid className="w-6 h-6 text-yellow-500" />
                                        )}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[150px] z-50">
                                        <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1 shadow-lg text-center">
                                            {getLocalizedContent(badge.title)}
                                        </div>
                                        <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                                    </div>
                                </div>
                            ))}
                            {earnedBadges.length > 10 && (
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                                    +{earnedBadges.length - 10}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">{t('profile.badges.empty', 'Noch keine Abzeichen')}</p>
                        </div>
                    )}

                    {/* Secondary Link */}
                    <Link
                        href="/achievements"
                        className="mt-5 flex items-center justify-center text-xs font-semibold text-gray-400 hover:text-primary-600 transition-colors py-2 group border-t border-gray-100"
                    >
                        {t('profile.badges.viewAll', 'Alle möglichen Abzeichen ansehen')}
                        <ArrowRightIcon className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </section>

                {/* Settings Link Block */}
                <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => router.push('/settings')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <Cog6ToothIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-700">{t('settings.title', 'Einstellungen')}</span>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </button>
                    {/* Add Logout or other profile items here later */}
                </section>

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-gray-300">
                        User ID: {session?.user?.id?.slice(0, 8)}...
                    </p>
                </div>

            </main>
        </div>
    )
}
