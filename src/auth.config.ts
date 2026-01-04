import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [], // Providers configured in auth.ts
    pages: {
        signIn: "/auth/signin",
        verifyRequest: "/auth/verify-request",
        error: "/auth/error",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Add simple boolean check or logic if needed, but we use middleware.ts for full logic
            return true
        },
        // JWT callback to persist user data into the token
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.preferredScript = user.preferredScript
                // @ts-ignore
                token.dailyGoal = user.dailyGoal
                // @ts-ignore
                token.streak = user.streak
                // @ts-ignore
                token.totalXP = user.totalXP
                // @ts-ignore
                token.isAdmin = user.isAdmin
                // @ts-ignore
                token.nickname = user.nickname
                // @ts-ignore
                token.firstName = user.firstName
                // @ts-ignore
                token.lastName = user.lastName
            }

            // Handle session updates (e.g. after onboarding)
            if (trigger === "update" && session) {
                if (session.user) {
                    token.nickname = session.user.nickname
                    token.firstName = session.user.firstName
                    token.lastName = session.user.lastName
                    token.preferredScript = session.user.preferredScript
                    token.dailyGoal = session.user.dailyGoal
                }
            }
            return token
        },
        // Session callback to expose token data to the client/session
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                // @ts-ignore
                session.user.preferredScript = token.preferredScript
                // @ts-ignore
                session.user.dailyGoal = token.dailyGoal as number
                // @ts-ignore
                session.user.streak = token.streak as number
                // @ts-ignore
                session.user.totalXP = token.totalXP as number
                // @ts-ignore
                session.user.isAdmin = token.isAdmin as boolean
                // @ts-ignore
                session.user.nickname = token.nickname as string
                // @ts-ignore
                session.user.firstName = token.firstName as string
                // @ts-ignore
                session.user.lastName = token.lastName as string
            }
            return session
        },
    },
} satisfies NextAuthConfig
