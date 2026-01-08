"use client"

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'

import { PlayIcon, SparklesIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/use-translation'

export function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await signIn('resend', { email, callbackUrl: '/', redirect: false })
      setSubmitted(true)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary-500/10 pb-16 pt-12 sm:pb-24 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="relative w-64 h-32 sm:w-80 sm:h-40">
                <Image
                  src="/images/logo-full.png"
                  alt="Zazakî Quiz"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-4xl font-serif font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
              {t('welcome.hero.title', 'Lerne Zazakî')} <br />
              <span className="text-primary-600 relative inline-block">
                {t('welcome.hero.subtitle', 'spielerisch')}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 font-sans max-w-lg mx-auto">
              {t('welcome.hero.desc', 'Effektives Vokabel-Lernen, herausfordernde Quizze und spielerischer Fortschritt. Übe Kostenlos. Werde jeden Tag ein bisschen besser.')}
            </p>

            <div className="mt-10 max-w-sm mx-auto">
              {submitted ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-primary-100 text-center animate-slide-up">
                  <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{t('welcome.email.check', 'Posteingang prüfen!')}</h3>
                  <p className="text-gray-600">{t('welcome.email.sent', 'Link wurde gesendet an')} <span className="font-semibold">{email}</span></p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    {t('welcome.email.other', 'Andere E-Mail verwenden')}
                  </button>
                </div>
              ) : (
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('welcome.input.placeholder', 'Deine E-Mail Adresse')}
                    className="flex-1 px-4 py-3 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none text-gray-900 placeholder-gray-500"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleMagicLink(e)
                      }
                    }}
                  />
                  <button
                    onClick={handleMagicLink}
                    disabled={isLoading || !email}
                    className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-gray-900 font-bold shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {t('welcome.cta.start', 'Loslegen')} <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
              <p className="mt-4 text-xs text-center text-gray-500">
                {t('welcome.input.note', 'Kein Passwort nötig. Login via E-Mail Magic Link.')}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-200 to-brand-orange/30 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              icon: <PlayIcon className="w-6 h-6 text-white" />,
              bg: "bg-brand-green",
              title: t('welcome.feat.vocab.title', 'Vokabel-Training'),
              desc: t('welcome.feat.vocab.desc', 'Erweitere deinen Wortschatz Schritt für Schritt')
            },
            {
              icon: <SparklesIcon className="w-6 h-6 text-white" />,
              bg: "bg-brand-orange",
              title: t('welcome.feat.play.title', 'Spielerisches Lernen'),
              desc: t('welcome.feat.play.desc', 'Sammle XP, halte Streaks und erklimme die Bestenliste')
            },
            {
              icon: <AcademicCapIcon className="w-6 h-6 text-white" />,
              bg: "bg-brand-red",
              title: t('welcome.feat.adapt.title', 'Adaptives Lernen'),
              desc: t('welcome.feat.adapt.desc', 'Wiederholungen passen sich deinem Tempo an')
            }
          ].map((feature, idx) => (
            <div key={idx} className="group relative rounded-2xl border border-gray-100 bg-white p-8 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 shadow-sm ${feature.bg}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 font-sans leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

