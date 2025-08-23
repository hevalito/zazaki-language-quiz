import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      preferredScript?: "LATIN" | "ARABIC"
      dailyGoal?: number
      streak?: number
      totalXP?: number
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    preferredScript?: "LATIN" | "ARABIC"
    dailyGoal?: number
    streak?: number
    totalXP?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    preferredScript?: "LATIN" | "ARABIC"
    dailyGoal?: number
    streak?: number
    totalXP?: number
  }
}
