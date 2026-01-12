"use client"

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'

function SignInPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')
  const [submitted, setSubmitted] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn('resend', { email, callbackUrl, redirect: false })
      setSubmitted(true)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4">
            <Image
              src="/images/logo-full.png"
              alt="Zazakî Quiz"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 dark:text-gray-100">
            {t('auth.signin.title', 'Anmelden')}
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400 font-sans">
            {t('auth.signin.subtitle', 'Starte deine Zazakî-Lernreise')}
          </p>
        </div>

        {/* Form Section */}
        <div className="mt-8 bg-gray-50/50 dark:bg-gray-900/50 py-8 px-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-2xl sm:px-10 transition-colors">
          {error && (
            <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
              <p className="text-sm font-medium text-brand-red">
                {error === 'Configuration' && t('auth.error.configuration', 'Konfigurationsfehler.')}
                {error === 'AccessDenied' && t('auth.error.accessDenied', 'Zugriff verweigert.')}
                {error === 'Verification' && t('auth.error.verification', 'Link abgelaufen oder bereits verwendet.')}
                {!['Configuration', 'AccessDenied', 'Verification'].includes(error) && t('auth.error.default', 'Anmeldung fehlgeschlagen.')}
              </p>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">{t('auth.checkEmail.title', 'E-Mail prüfen!')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('auth.checkEmail.sent', 'Wir haben einen Magic Link an')}{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{email}</span>{' '}
                {t('auth.checkEmail.sentSuffix', 'gesendet.')}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                {t('auth.useAnotherEmail', 'Andere E-Mail verwenden')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-sans mb-2">
                  {t('auth.email.label', 'E-Mail Adresse')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all sm:text-sm bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="name@beispiel.de"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleEmailSignIn(e)
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 dark:text-white bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {loading ? t('common.sending', 'Sende...') : t('auth.sendLink', 'Magic Link senden')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignInPage
