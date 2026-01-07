import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    // Explicitly check for user existence to avoid partial session objects
    const isLoggedIn = !!req.auth?.user
    const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding")
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isApiAuthByPass = req.nextUrl.pathname.startsWith("/api/auth")
    const isPublicAsset = req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

    if (isApiAuthByPass || isPublicAsset) return

    // If trying to access onboarding but not logged in, redirect to home/login
    if (isOnboarding && !isLoggedIn) {
        const url = req.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
    }

    // If logged in
    if (isLoggedIn) {
        const user = req.auth?.user
        // Check if profile is complete
        const isProfileComplete = (user as any)?.firstName && (user as any)?.lastName && (user as any)?.nickname

        // If profile incomplete and NOT on onboarding, redirect to onboarding
        if (!isProfileComplete && !isOnboarding) {
            const url = req.nextUrl.clone()
            url.pathname = "/onboarding"
            return NextResponse.redirect(url)
        }

        // If profile complete and ON onboarding, redirect to dashboard
        if (isProfileComplete && isOnboarding) {
            const url = req.nextUrl.clone()
            url.pathname = "/"
            return NextResponse.redirect(url)
        }
    }

    // Protect private routes
    // ONLY allow public access to:
    // 1. Root (Landing Page checks auth internally)
    // 2. Course Finder (Public Tool)
    // 3. Auth Pages (Sign In, etc)
    // 4. Static PWA assets (manifest, robots)
    const isPublicRoute =
        req.nextUrl.pathname === "/" ||
        req.nextUrl.pathname.startsWith("/course-finder") ||
        req.nextUrl.pathname.startsWith("/api/course-finder") ||
        req.nextUrl.pathname === "/manifest.json" ||
        req.nextUrl.pathname === "/robots.txt" ||
        req.nextUrl.pathname === "/sw.js" ||
        req.nextUrl.pathname === "/push-worker.js" ||
        req.nextUrl.pathname.startsWith("/share/achievement")

    if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
        // Construct absolute URL using the Host header to ensure we redirect to the correct domain/port.
        // This handles cases where the internal container port (e.g. 3000) differs from the public port (e.g. 3001).
        const host = req.headers.get("host") || req.nextUrl.host
        const protocol = req.nextUrl.protocol

        const signInUrl = new URL("/auth/signin", `${protocol}//${host}`)
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search)

        return NextResponse.redirect(signInUrl)
    }

    return
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


