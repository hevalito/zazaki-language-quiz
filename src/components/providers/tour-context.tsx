'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { driver, Driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useSession } from 'next-auth/react'

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

    const steps: (DriveStep & { nextRoute?: string })[] = [
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
                    // Start navigation
                    router.push('/leaderboard')
                    // Setup resume after navigation
                    // We need to signal that we are moving to step index 5 (index 4 is this one)
                    localStorage.setItem('zazaki-tour-index', '5')
                    // We can't preventDefault nicely here to STOP driver.js immediately and keep overlay?
                    // Verify API: onNextClick receives event?
                    // If we navigate, page unloads. Driver destroys.
                    // IMPORTANT: driver.js usually destroys on route change.
                }
            },
            nextRoute: '/leaderboard' // Custom prop for our logic
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
        // Problem: Link to achievements is on Home Screen usually, but we are on Leaderboard page.
        // We need to go BACK to home or use a global nav?
        // Leaderboard page has a back button.
        // OR we just route the user directly to Achievements page from here?
        // Let's route directly to /achievements to keep flow smooth.
        {
            // Floating step or attached to body?
            // Or attach to "Back" button?
            // Let's just create a bridge step.
            element: 'header', // Generic target on Leaderboard page
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
            element: 'header', // Generic target on Achievements page
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
        },

        // FINISH -> Home
        {
            element: 'body',
            popover: {
                title: 'Los geht\'s!',
                description: 'Das war\'s! Viel Spaß beim Lernen. Qewet bo!',
                side: 'top',
                doneBtnText: 'Fertig',
                onNextClick: () => {
                    router.push('/')
                    finishTour()
                }
            }
        }
    ]

    const finishTour = async () => {
        setTourActive(false)
        localStorage.setItem('zazaki-tour-completed', 'true')
        localStorage.removeItem('zazaki-tour-index')
        if (driverRef.current) {
            driverRef.current.destroy()
        }
        if (session?.user) {
            await fetch('/api/user/complete-tour', { method: 'POST' })
        }
    }

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
    }, [router]) // Re-init on router change? No, keep ref.

    // Effect to Start/Resume Tour
    useEffect(() => {
        // Check if we should be running the tour
        const savedIndex = localStorage.getItem('zazaki-tour-index')
        const isCompleted = localStorage.getItem('zazaki-tour-completed')

        // Check API if not completed locally
        const checkApi = async () => {
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
                // Small delay to ensure DOM is ready after route change
                setTimeout(() => {
                    startDriver(parseInt(savedIndex))
                }, 800)
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
