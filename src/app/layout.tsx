import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import { auth } from '@/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

// Dynamic Metadata
export async function generateMetadata(): Promise<Metadata> {
  const { getDictionary } = await import('@/lib/translations')
  const dictionary = await getDictionary('de')
  const t = (key: string, defaultValue: string) => dictionary[key] || defaultValue

  const title = t('meta.title', 'Zazakî Quiz - Lerne Zazakî spielerisch')
  const description = t('meta.desc', 'Effektives Vokabel-Lernen, herausfordernde Quizze und spielerischer Fortschritt. Übe Kostenlos. Werde jeden Tag ein bisschen besser.')
  const ogTitle = t('meta.og.title', 'Zazakî Quiz - Lerne Zazakî spielerisch')
  const ogDesc = t('meta.og.desc', 'Der moderne Weg, Zazakî zu lernen. Kostenlos, effektiv und mit Spaß.')
  const twitterDesc = t('meta.twitter.desc', 'Effektives Vokabel-Lernen und Gamification.')
  const pwaTitle = t('meta.pwa.title', 'Zazakî')

  return {
    title,
    description,
    metadataBase: new URL('https://quiz.zazakiacademy.com'),
    manifest: '/manifest.json',
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: 'https://quiz.zazakiacademy.com',
      siteName: 'Zazakî Academy',
      locale: 'de_DE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: twitterDesc,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: pwaTitle,
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#FF9A00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}


import { UnlockManager } from '@/components/achievements/unlock-manager'
import { TourProvider } from '@/components/providers/tour-context'
import { ChangelogModal } from '@/components/features/changelog-modal'
import { TranslationProvider } from '@/components/providers/translation-provider'
import { getDictionary } from '@/lib/translations'

import { MobileNav } from '@/components/layout/mobile-nav'
import { getSystemSettings } from '@/lib/settings'
import MaintenancePage from './maintenance/page'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const settings = await getSystemSettings()
  const dictionary = await getDictionary('de') // Defaulting to German for now

  // BLOCK: Maintenance Mode
  if (settings.maintenance_mode) {
    const isAdmin = session?.user?.email === 'heval@me.com' || (session?.user as any)?.isAdmin // Backup check
    if (!isAdmin) {
      return (
        <html lang="en" className="h-full">
          <body className={`${inter.variable} ${playfair.variable} font-sans h-full bg-gray-50 text-gray-900`}>
            <MaintenancePage />
          </body>
        </html>
      )
    }
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans h-full bg-gray-50 text-gray-900`}>
        <Providers session={session}>
          <TranslationProvider dictionary={dictionary} locale="de">
            <UnlockManager />
            <TourProvider>
              <div className="min-h-full pb-20 md:pb-0">
                {children}
              </div>
              <ChangelogModal />
              <MobileNav />
            </TourProvider>
          </TranslationProvider>
        </Providers>
      </body>
    </html>
  )
}
