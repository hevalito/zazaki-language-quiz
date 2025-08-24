import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Email from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import type { NextAuthConfig } from "next-auth"

export const config = {
  trustHost: true, // Required for production deployments
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Add user preferences to session
        const userWithPrefs = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            preferredScript: true,
            dailyGoal: true,
            streak: true,
            totalXP: true,
          },
        })
        if (userWithPrefs) {
          session.user.preferredScript = userWithPrefs.preferredScript
          session.user.dailyGoal = userWithPrefs.dailyGoal
          session.user.streak = userWithPrefs.streak
          session.user.totalXP = userWithPrefs.totalXP
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Auto-create user profile on first sign in
      if (account?.provider && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          })
          
          if (!existingUser) {
            // User will be created by the adapter, we don't need to do anything here
            // The default values are already set in the schema
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // Continue with sign in even if there's an error
        }
      }
      return true
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
