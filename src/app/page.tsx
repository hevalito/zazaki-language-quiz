import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { HomeScreen } from '@/components/screens/home-screen'
import { WelcomeScreen } from '@/components/screens/welcome-screen'

interface PageProps {
  searchParams: Promise<{ guest?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams
  const isGuest = params.guest === 'true'

  if (!session && !isGuest) {
    return <WelcomeScreen />
  }

  return <HomeScreen />
}
