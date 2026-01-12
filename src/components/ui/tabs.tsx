"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
} | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, value, onValueChange, children, ...props }, ref) => (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div ref={ref} className={cn("", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div className="border-b border-gray-200 dark:border-gray-800">
        <div
            ref={ref}
            className={cn("-mb-px flex space-x-8", className)}
            {...props}
        />
    </div>
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsTrigger must be used within Tabs")

        const isActive = context.value === value

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => context.onValueChange(value)}
                className={cn(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all",
                    isActive
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsContent must be used within Tabs")

        if (context.value !== value) return null

        return (
            <div
                ref={ref}
                className={cn(
                    "mt-6 ring-offset-background focus-visible:outline-none",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
