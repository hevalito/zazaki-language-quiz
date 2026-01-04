# Zazaki Quiz App

A modern, mobile-first Progressive Web App (PWA) for learning the Zazaki (Kurdish) language through interactive multiple-choice quizzes.

![Zazaki Quiz App](/images/logo-full.png)

## Overview

This application is designed to help users learn Zazaki vocabulary and grammar. It focuses on a streamlined, gamified quiz experience with Dual Script support (Latin/Arabic). The project is built for performance and mobile usage, featuring offline capabilities and passwordless authentication.

## ✨ Key Features

### Core Learning
- **Multiple Choice Quizzes**: Interactive vocabulary and grammar testing.
- **Dual Script Support**: Toggle between Latin and Arabic scripts for Zazaki text.
- **Gamification**:
  - **Streaks**: Track consecutive days of learning.
  - **Leaderboard**: Compete with other learners based on XP.
  - **XP System**: Earn points for correct answers and completed quizzes.

### User Experience
- **Progressive Web App (PWA)**: Installable on mobile devices with offline caching for assets.
- **Onboarding Flow**: Simple profile setup (Name/Nickname) for personalized certificates and leaderboards.
- **Responsive Design**: Mobile-first UI tailored for touch interactions.

### Authentication
- **Magic Link**: Secure, passwordless login via email (powered by Resend).
- **Session Management**: Persistent sessions using NextAuth.js (Auth.js) v5.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Edge-compatible) + Resend
- **State Management**: TanStack Query v5
- **Deployment**: Optimized for Railway / Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Resend API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zazaki-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```
   
   **Required Variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `AUTH_SECRET`: Random string for session encryption.
   - `AUTH_RESEND_KEY`: Your Resend API Key.
   - `NEXT_PUBLIC_APP_URL`: The URL of your app (e.g., `http://localhost:3000`).

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # Backend API routes
│   ├── auth/             # Login & Verification pages
│   ├── onboarding/       # User profile setup
│   ├── leaderboard/      # XP Leaderboard
│   └── ...
├── components/           # React Components
│   ├── questions/        # Quiz Interfaces (Multiple Choice)
│   ├── screens/          # Main Application Views
│   └── ...
├── lib/                  # Utilities (Prisma, Gamification, etc.)
├── middleware.ts         # Edge Middleware (Auth enforcement)
├── auth.ts               # Auth.js Backend Config (Adapter)
└── auth.config.ts        # Auth.js Edge Config
```

## 🤝 Contributing

This is a public repository. We welcome contributions to expand the quiz content or add new question types (Audio/Video).

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/audio-quiz`).
3. Commit your changes.
4. Open a Pull Request.

## License

MIT License.
