# Zazaki Quiz App

A modern, mobile-first Progressive Web App (PWA) for learning the Zazaki (Kurdish) language through interactive multiple-choice quizzes, daily challenges, and gamified progress tracking.

![Zazaki Quiz App](/images/logo-full.png)

## Overview

This application is designed to help users learn Zazaki vocabulary and grammar. It focuses on a streamlined, gamified quiz experience with Dual Script support (Latin/Arabic). The project is built for performance and mobile usage, featuring offline capabilities and passwordless authentication.

## ✨ Key Features

### Core Learning
- **Multiple Choice Quizzes**: Interactive vocabulary and grammar testing.
- **Daily Challenges**: A unique, generated quiz available every 24 hours to build habits.
- **Dual Script Support**: Toggle between Latin and Arabic scripts for Zazaki text.
- **Gamification**:
  - **Streaks**: Track consecutive days of learning.
  - **Leaderboard**: Compete with other learners based on XP.
  - **Badges**: Earn achievements for milestones.

### Administrative Tools (Admin Panel)
- **Question Bank**: Centralized repository of all questions.
  - **CSV Import**: Bulk upload questions from spreadsheets (supports multilingual columns).
  - **Question Linking**: Reuse questions across multiple quizzes.
- **Course Management**: Organize quizzes into Lessons and Chapters.
- **Daily Quiz Management**: Review and reset daily challenges.

### User Experience
- **Progressive Web App (PWA)**: Installable on mobile devices with offline caching using `next-pwa`.
- **Onboarding Flow**: Simple profile setup for personalized certificates.
- **Responsive Design**: Mobile-first UI tailored for touch interactions.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Edge-compatible) + Resend
- **State Management**: TanStack Query v5
- **Deployment**: Optimized for Railway (Docker)

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
   *Note: `@types/papaparse` is included in `dependencies` to ensure build stability.*

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
│   ├── admin/            # Admin Panel (Questions, Quizzes, Users)
│   ├── api/              # Backend API routes
│   ├── auth/             # Login pages
│   └── ...
├── components/           # React Components
│   ├── admin/            # Admin UI (QuestionImporter, Pickers)
│   ├── questions/        # Quiz Interfaces
│   └── ...
├── lib/                  # Utilities (Prisma, Gamification, etc.)
└── scripts/              # Maintenance scripts (make-admin.ts)
```

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Open a Pull Request.

## License

MIT License.
