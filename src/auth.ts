import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import ResendProvider from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"
import { ZazakiMagicLinkEmail } from "@/components/emails/magic-link-email"
import { authConfig } from "./auth.config"
import { Resend } from "resend"

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Required for Middleware compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ResendProvider({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "Zazaki Academy <login@zazakiacademy.com>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url)
        try {
          await resend.emails.send({
            from: provider.from!,
            to: identifier,
            subject: `Anmelden bei Zazaki Quiz`,
            react: ZazakiMagicLinkEmail({ url, host }),
          })
        } catch (error) {
          console.error("Error sending verification email", error)
          throw new Error("Failed to send verification email")
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Auto-create user profile on first sign in
      if (account?.provider && user.email) {
        try {
          // Force Admin for specific users
          if (user.email === 'heval@me.com' || user.email === 'mail@zazakiacademy.com') {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email }
            });

            if (existingUser && !existingUser.isAdmin) {
              await prisma.user.update({
                where: { email: user.email },
                data: { isAdmin: true }
              })
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // Continue with sign in even if there's an error
        }
      }
      return true
    },
  },
  debug: process.env.NODE_ENV === "development",
})
