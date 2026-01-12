"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"

export function ThemeSelector() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full h-[42px]" />
        )
    }

    const handleThemeChange = async (newTheme: string) => {
        setTheme(newTheme)

        // Persist to DB
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme.toUpperCase() })
            })
        } catch (error) {
            console.error('Failed to persist theme preference', error)
        }
    }

    return (
        <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${theme === 'light'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
            >
                <Sun className="w-4 h-4" />
                <span>Hell</span>
            </button>
            <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${theme === 'dark'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
            >
                <Moon className="w-4 h-4" />
                <span>Dunkel</span>
            </button>
            <button
                onClick={() => handleThemeChange('system')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${theme === 'system'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
            >
                <Monitor className="w-4 h-4" />
                <span>System</span>
            </button>
        </div>
    )
}
