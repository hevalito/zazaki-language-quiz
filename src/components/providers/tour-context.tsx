'use client'

import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { driver, Driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useSession } from 'next-auth/react'
import { useWebPush } from '@/hooks/use-web-push'

interface TourContextType {
    startTour: () => void
    tourActive: boolean
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    // Use ref to keep track of the driver instance
    const driverRef = useRef<Driver | null>(null)
    const [tourActive, setTourActive] = useState(false)
    const { isSupported } = useWebPush()

    // Configuration for steps
    // We break them down by "Page" to make multi-page navigation handling easier?
    // Or we use a big list and try to jump?
    // Driver.js determines "popover" position, but if element missing, it might fail.

    // Robust Multi-Page Strategy with Driver.js:
    // 1. Store current "Global Step Index" in localStorage.
    // 2. Define a flat list of steps.
    // 3. Check if current step's element exists.
    // 4. If yes, highlight it. 
    // 5. If "Next" is clicked and next step is on another page -> Route -> Wait -> Resume.



    const finishTour = useCallback(async () => {
        setTourActive(false)
        localStorage.setItem('zazaki-tour-completed', 'true')
        localStorage.removeItem('zazaki-tour-index')
        if (driverRef.current) {
            driverRef.current.destroy()
        }
        if (session?.user) {
            await fetch('/api/user/complete-tour', { method: 'POST' })
        }
    }, [session])

    const steps: (DriveStep & { nextRoute?: string })[] = useMemo(() => {
        const baseSteps: (DriveStep & { nextRoute?: string })[] = [
            // HOME STEPS
            {
                element: '#tour-welcome',
                popover: {
                    title: 'Xêr ama!',
                    description: 'Willkommen bei Zazakî Quiz! Hier lernst du spielerisch Zazakî.',
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '#tour-daily-goal',
                popover: {
                    title: 'Tagesziel setzen',
                    description: 'Setze dir ein tägliches Ziel. XP sammelst du durch Quizze und Übungen.',
                    side: 'left'
                }
            },
            {
                element: '#tour-daily-challenge',
                popover: {
                    title: 'Tägliche Challenge',
                    description: 'Hier findest du jeden Tag ein neues, kurzes Quiz. Halte deinen Streak am Leben!',
                    side: 'top'
                }
            },
            {
                element: '#tour-continue-learning',
                popover: {
                    title: 'Weiterlernen',
                    description: 'Hier geht es mit deiner Quiz-Journey weiter. Wir wählen immer das passende nächste Quiz für dich aus.',
                    side: 'top'
                }
            },

            // LEADERBOARD NAVIGATION
            {
                element: '#tour-leaderboard-nav',
                popover: {
                    title: 'Bestenliste',
                    description: 'Messe dich mit anderen Lernenden! Klicken wir mal drauf...',
                    side: 'top',
                    onNextClick: () => {
                        router.push('/leaderboard')
                        localStorage.setItem('zazaki-tour-index', '5')
                    }
                },
                nextRoute: '/leaderboard'
            },

            // LEADERBOARD PAGE
            {
                element: '#leaderboard-list',
                popover: {
                    title: 'Wöchentlicher Wettkampf',
                    description: 'Hier siehst du, wer diese Woche die meisten XP gesammelt hat. Schaffst du es in die Top 3?',
                    side: 'bottom'
                }
            },

            // ACHIEVEMENT NAVIGATION
            {
                element: 'header',
                popover: {
                    title: 'Weiter zu Erfolgen',
                    description: 'Schauen wir uns jetzt deine Trophäen an.',
                    side: 'bottom',
                    onNextClick: () => {
                        router.push('/achievements')
                        localStorage.setItem('zazaki-tour-index', '7')
                    }
                },
                nextRoute: '/achievements'
            },

            // ACHIEVEMENTS PAGE
            {
                element: '#achievements-grid',
                popover: {
                    title: 'Trophäensammlung',
                    description: 'Sammle Abzeichen für besondere Leistungen. Klicke auf ein Abzeichen, um zu sehen, wie du es freischaltest.',
                    side: 'top'
                }
            },

            // SETTINGS NAVIGATION
            {
                element: 'header',
                popover: {
                    title: 'Profil einrichten',
                    description: 'Zu guter Letzt: Dein Profil anpassen.',
                    side: 'bottom',
                    onNextClick: () => {
                        router.push('/settings')
                        localStorage.setItem('zazaki-tour-index', '9')
                    }
                },
                nextRoute: '/settings'
            },

            // SETTINGS PAGE
            {
                element: '#tour-profile-picture',
                popover: {
                    title: 'Zeig dich!',
                    description: 'Lade ein schönes Profilbild hoch, damit dich deine Freunde in der Bestenliste erkennen!',
                    side: 'bottom'
                }
            }
        ]

        if (isSupported) {
            baseSteps.push({
                element: '#tour-notifications',
                popover: {
                    title: 'Bleib am Ball',
                    description: 'Aktiviere Benachrichtigungen, um deine tägliche Challenge nicht zu verpassen. Kein Spam. Du kannst sie jederzeit wieder abschalten.',
                    side: 'bottom'
                }
            })
        }

        // FINISH Step
        baseSteps.push({
            element: 'body',
            popover: {
                title: "Los geht's!",
                description: "Das war's! Viel Spaß beim Lernen. Qewet bo!",
                side: 'top',
                doneBtnText: 'Fertig',
                onNextClick: () => {
                    router.push('/')
                    finishTour()
                }
            }
        })

        return baseSteps
    }, [isSupported, router, finishTour])

    // Initialize Driver
    useEffect(() => {
        driverRef.current = driver({
            animate: true,
            showProgress: true,
            allowClose: true, // Allow user to exit
            steps: steps,
            nextBtnText: 'Weiter',
            prevBtnText: 'Zurück',
            doneBtnText: 'Fertig',
            progressText: '{{current}} von {{total}}',
            onDestroyed: () => {
                // If destroyed manually by user clicking overlay or X, we might want to mark as seen?
                // Or just pause? Let's check if it was "finished".
                // We'll trust manual explicit finish.
                setTourActive(false)
            },
            onNextClick: (img, step, config) => {
                // Handle navigation steps specially
                // We find the CURRENT step in our array
                // driver.js doesn't expose strict index in callback easily (it gives element)
                // But we defined onNextClick IN the steps themselves above.
                // So specific logic is handled there. 

                // Standard behavior: moveNext()
                if (driverRef.current) {
                    driverRef.current.moveNext()
                }
            }
        })



        // Effect to Start/Resume Tour
        useEffect(() => {
            // Guard: Never run tour on onboarding or auth pages
            if (pathname?.startsWith('/onboarding') || pathname?.startsWith('/auth')) {
                return
            }

            // Check if we should be running the tour
            const savedIndex = localStorage.getItem('zazaki-tour-index')
            const isCompleted = localStorage.getItem('zazaki-tour-completed')

            // Check API if not completed locally
            const checkApi = async () => {
                // Only auto-start fresh tour if we are on the HOME page
                if (pathname !== '/') return

                if (session?.user?.id && !isCompleted && !savedIndex) {
                    const res = await fetch('/api/user/profile')
                    const data = await res.json()
                    if (!data.hasSeenTour) {
                        // Start fresh
                        startDriver(0)
                    } else {
                        localStorage.setItem('zazaki-tour-completed', 'true')
                    }
                }
            }

            if (session?.user) {
                if (savedIndex && !isCompleted) {
                    // Resume!
                    // Mapped routing: Ensure we are on the right page for the step?
                    // For now, just rely on the step index and the user being on the right page 
                    // (which strictly happens via our onNextClick navigation).

                    // Increase delay to account for API data fetching (like badges)
                    // 1500ms is safer for cold starts / network requests
                    setTimeout(() => {
                        if (driverRef.current) {
                            // Check if the current step references an element that exists
                            // If not, maybe wait longer or abort?
                            // Driver.js will warn if element missing.
                            startDriver(parseInt(savedIndex))
                        }
                    }, 1500)
                } else {
                    checkApi()
                }
            }
        }, [pathname, session]) // Check on every path change


        const startDriver = (index: number) => {
            if (driverRef.current) {
                setTourActive(true)
                driverRef.current.drive(index)
            }
        }

        return (
            <TourContext.Provider value={{ startTour: () => startDriver(0), tourActive }}>
                {children}
            </TourContext.Provider>
        )
    }

export const useTour = () => {
        const context = useContext(TourContext)
        if (context === undefined) {
            throw new Error('useTour must be used within a TourProvider')
        }
        return context
    }
