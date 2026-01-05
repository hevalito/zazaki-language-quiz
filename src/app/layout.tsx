import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import { auth } from '@/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Zazaki Quiz - Lerne Zazakî spielerisch',
  description: 'Effektives Vokabel-Lernen, herausfordernde Quizze und spielerischer Fortschritt. Übe Kostenlos. Werde jeden Tag ein bisschen besser.',
  metadataBase: new URL('https://quiz.zazakiacademy.com'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'Zazaki Quiz - Lerne Zazakî spielerisch',
    description: 'Der moderne Weg, Zazakî zu lernen. Kostenlos, effektiv und mit Spaß.',
    url: 'https://quiz.zazakiacademy.com',
    siteName: 'Zazaki Academy',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zazaki Quiz - Lerne Zazakî spielerisch',
    description: 'Effektives Vokabel-Lernen und Gamification.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zazaki',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#febd11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { UnlockManager } from '@/components/achievements/unlock-manager'
import { TourProvider } from '@/components/providers/tour-context'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans h-full bg-gray-50 text-gray-900`}>
        <Providers session={session}>
          <UnlockManager />
          <TourProvider>
            <div className="min-h-full">
              {children}
            </div>
          </TourProvider>
        </Providers>
      </body>
    </html>
  )
}
