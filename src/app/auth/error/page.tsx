"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/use-translation'

export default function AuthErrorPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: t('auth.error.config', "There is a problem with the server configuration."),
    AccessDenied: t('auth.error.access', "You do not have permission to sign in."),
    Verification: t('auth.error.verification_token', "The verification token has expired or has already been used."),
    Default: t('auth.error.default_auth', "An error occurred during authentication."),
  }

  const message = (error && errorMessages[error]) || errorMessages.Default

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('auth.error.title', 'Authentication Error')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {error === 'Configuration' && (
                <>
                  {t('auth.error.configDetail', 'The authentication system is not properly configured for local development. For now, you can access the app as a guest or contact the administrator.')}
                </>
              )}
              {error === 'Verification' && (
                <>
                  {t('auth.error.verificationDetail', 'The magic link has expired or has already been used. Please request a new one.')}
                </>
              )}
              {error === 'AccessDenied' && (
                <>
                  {t('auth.error.accessDetail', "You don't have permission to access this application. Please contact an administrator.")}
                </>
              )}
              {!error && (
                <>
                  {t('auth.error.defaultDetail', 'An unexpected error occurred during authentication. Please try again.')}
                </>
              )}
            </p>

            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('common.backToHome', 'Back to Home')}
              </Link>

              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-gray-900"
              >
                {t('common.tryAgain', 'Try Again')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
