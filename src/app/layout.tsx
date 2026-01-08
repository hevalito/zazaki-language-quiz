import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import { auth } from '@/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Zazakî Quiz - Lerne Zazakî spielerisch',
  description: 'Effektives Vokabel-Lernen, herausfordernde Quizze und spielerischer Fortschritt. Übe Kostenlos. Werde jeden Tag ein bisschen besser.',
  metadataBase: new URL('https://quiz.zazakiacademy.com'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'Zazakî Quiz - Lerne Zazakî spielerisch',
    description: 'Der moderne Weg, Zazakî zu lernen. Kostenlos, effektiv und mit Spaß.',
    url: 'https://quiz.zazakiacademy.com',
    siteName: 'Zazakî Academy',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zazakî Quiz - Lerne Zazakî spielerisch',
    description: 'Effektives Vokabel-Lernen und Gamification.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zazakî',
  },
  formatDetection: {
    telephone: false,
  },
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

  // BLOCK: Maintenance Mode
  if (settings.maintenance_mode) {
    const isAdmin = session?.user?.email === 'heval@me.com' || (session?.user as any)?.isAdmin // Backup check
    if (!isAdmin) {
      // We can't redirect easily in a layout to a sibling page without causing loop if not careful.
      // Better: Conditional rendering or redirecting if NOT on the maintenance page.
      // But we are in RootLayout.
      // Let's use a conditional Return.
      // NOTE: This will block ALL routes including /maintenance if we aren't careful.
      // A cleaner way is doing this in a MaintenanceWrapper component or Middleware.
      // Given Middleware constraint, let's try to handle it here but identifying the path is hard in Server Component Layouts (no headers/url access easily).

      // Actually, we can just Render the Maintenance Page directly here and NOT render children!
      // But we need to allow Admin Login? 
      // If maintenance mode is ON, and user is NOT logged in, how do they log in?
      // They can't. Admin must be logged in BEFORE activating, or we whitelist /auth routes.
      // Whitelisting /auth in Layout is hard.

      // ALTERNATIVE: Use the new `maintenance` page content instead of children.
      // To allow Login, we'd need to check if headers refer to /auth.
      // Let's keep it simple: If Maintenance Mode is ON, Show Maintenance Screen for everyone except Admins.
      // If Admin gets locked out, they can toggle DB via SQL or Console.

      // We'll import the Maintenance Page component.
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
          <UnlockManager />
          <TourProvider>
            <div className="min-h-full pb-20 md:pb-0">
              {children}
            </div>
            <ChangelogModal />
            <MobileNav />
          </TourProvider>
        </Providers>
      </body>
    </html>
  )
}
