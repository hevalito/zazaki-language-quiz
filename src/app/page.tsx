import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { HomeScreen } from '@/components/screens/home-screen'
import { WelcomeScreen } from '@/components/screens/welcome-screen'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    return <WelcomeScreen />
  }

  return <HomeScreen />
}
