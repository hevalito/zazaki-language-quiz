import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding")
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isApiAuthByPass = req.nextUrl.pathname.startsWith("/api/auth")
    const isPublicAsset = req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

    if (isApiAuthByPass || isPublicAsset) return

    // If trying to access onboarding but not logged in, redirect to home/login
    if (isOnboarding && !isLoggedIn) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    // If logged in
    if (isLoggedIn) {
        const user = req.auth?.user
        // Check if profile is complete
        const isProfileComplete = (user as any)?.firstName && (user as any)?.lastName && (user as any)?.nickname

        // If profile incomplete and NOT on onboarding, redirect to onboarding
        if (!isProfileComplete && !isOnboarding) {
            return NextResponse.redirect(new URL("/onboarding", req.nextUrl))
        }

        // If profile complete and ON onboarding, redirect to dashboard
        if (isProfileComplete && isOnboarding) {
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
    }

    // Protect private routes
    if (!isLoggedIn && !isAuthPage && req.nextUrl.pathname !== "/" && req.nextUrl.pathname !== "/leaderboard") {
        return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
    }

    return
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


