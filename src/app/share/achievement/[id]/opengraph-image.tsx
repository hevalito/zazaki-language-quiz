
import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export const alt = 'Zazakî Quiz Achievement'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
    const { id } = await params

    // Fetch data
    const userBadge = await prisma.userBadge.findUnique({
        where: { id },
        include: {
            user: { select: { firstName: true, nickname: true, avatarUrl: true } },
            badge: { select: { title: true, iconUrl: true, imageUrl: true } }
        }
    })

    if (!userBadge) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: 'linear-gradient(to bottom right, #FF9F43, #FF6B6B)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 64,
                        fontWeight: 'bold',
                    }}
                >
                    Zazakî Quiz Achievement
                </div>
            )
        )
    }

    const { user, badge } = userBadge
    // Use Nickname as priority
    const userName = user.nickname || user.firstName || 'Ein Nutzer'
    const badgeTitle = (badge.title as any)?.de || (badge.title as any)?.en || 'Erfolg'

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '240px',
                    background: 'linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)',
                    display: 'flex',
                }} />

                {/* Content Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 80,
                    background: 'white',
                    padding: '40px 80px',
                    borderRadius: '40px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 10,
                    border: '1px solid #eee',
                    maxWidth: '80%'
                }}>
                    {/* User Avatar - using a colored circle with initial as fallback */}
                    <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        background: '#f3f4f6',
                        border: '6px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 60,
                        fontWeight: 'bold',
                        color: '#9ca3af',
                        marginBottom: 20,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        top: -60,
                        position: 'absolute'
                    }}>
                        {userName.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ height: 40 }} /> {/* Spacer for avatar overlap */}

                    <div style={{ fontSize: 28, color: '#6b7280', marginBottom: 10 }}>
                        {userName} hat einen Erfolg erzielt!
                    </div>

                    <div style={{ fontSize: 56, fontWeight: 900, color: '#111827', textAlign: 'center', lineHeight: 1.1, marginBottom: 20 }}>
                        {badgeTitle}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            fontSize: 24,
                            background: '#FFF4E6',
                            color: '#FF9F43',
                            padding: '12px 24px',
                            borderRadius: 100,
                            fontWeight: 'bold'
                        }}>
                            🏆 Achievement Unlocked
                        </div>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1f2937' }}>Zazakî Quiz</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
