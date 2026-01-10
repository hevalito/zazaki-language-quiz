import { ProfileScreen } from '@/components/screens/profile-screen'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profil | Zazaki Quiz',
    description: 'Dein Profil und Fortschritt',
}

export default function ProfilePage() {
    return <ProfileScreen />
}
