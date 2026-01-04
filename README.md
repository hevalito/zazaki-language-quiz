# Zazaki - Kurdish Language Learning App

A modern, mobile-first Progressive Web App (PWA) for learning Zazaki (Kurdish) through interactive quizzes with audio, video, and gamification features.

## Features

### 🎯 Core Learning Features
- **Multiple Question Types**: Multiple choice, audio comprehension, video comprehension, dictation, pronunciation check, and more
- **Dual Script Support**: Switch between Latin and Arabic scripts for Zazaki
- **Audio & Video Integration**: Native speaker audio and video content
- **Spaced Repetition**: SM-2 algorithm for optimized learning retention
- **Gamification**: XP system, streaks, badges, and daily goals

### 📱 Mobile-First Design
- **Progressive Web App (PWA)**: Install on mobile devices like a native app
- **Offline Support**: Cache lessons and media for offline learning
- **Touch-Optimized**: Large tap targets and mobile-friendly interactions
- **Responsive Design**: Works seamlessly on all screen sizes

### 🔐 Authentication & User Management
- **Magic Link Authentication**: Passwordless login via email (Resend)
- **Onboarding Flow**: Mandatory profile setup for new users
- **OAuth Integration**: Sign in with Google and Apple
- **Guest Mode**: Try the app without creating an account
- **Progress Tracking**: Automatic progress saving and sync

### 🎨 Modern Tech Stack
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma ORM** with PostgreSQL
- **NextAuth.js v5** (Auth.js) with Edge-compatible Middleware
- **Resend** for transactional emails
- **TanStack Query v5** for server state management

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Resend API Key (for magic links)
- OAuth credentials (Google/Apple)

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `AUTH_SECRET`: Random secret for Auth.js
   - `AUTH_RESEND_KEY`: Resend API Key for emails
   - `NEXT_PUBLIC_APP_URL`: Your app URL
   - OAuth provider credentials

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── onboarding/        # Onboarding flow
│   ├── leaderboard/       # Leaderboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── questions/         # Question type components
│   ├── screens/           # Main screen components
│   └── providers.tsx      # App providers
├── lib/                   # Utility libraries
│   ├── media-utils.ts     # Audio/video utilities
│   ├── prisma.ts          # Database client
│   ├── query-client.ts    # TanStack Query setup
│   └── spaced-repetition.ts # Learning algorithm
├── types/                 # TypeScript type definitions
├── auth.ts               # NextAuth.js Node.js config (Adapter)
├── auth.config.ts        # NextAuth.js Edge config (Middleware)
└── middleware.ts         # Edge Middleware for Auth & Routing
```

## Database Schema

The app uses a comprehensive database schema supporting:

- **User Management**: Users, sessions, accounts
- **Course Structure**: Courses → Chapters → Lessons → Quizzes → Questions
- **Progress Tracking**: Attempts, answers, progress records
- **Spaced Repetition**: Individual item tracking with SM-2 algorithm
- **Gamification**: Badges, user badges, XP tracking
- **Content Management**: Multi-language support, media attachments

## Key Features Implementation

### Spaced Repetition Algorithm
- Based on SM-2 algorithm
- Adjusts review intervals based on performance
- Tracks easiness factor, repetition count, and due dates
- Optimizes learning retention and efficiency

### Audio/Video Handling
- Web Audio API integration
- MediaRecorder for pronunciation exercises
- Playback rate control (slow/fast playback)
- Audio visualization and volume monitoring

### Multi-Language Content
- JSON fields for storing translations
- Script-specific rendering (Latin/Arabic)
- Flexible content localization system

### PWA Features
- Service worker for offline caching
- Web app manifest for installation
- Background sync capabilities
- Push notification support (future)

## Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure email service (SMTP or service like SendGrid)
3. Set up OAuth applications (Google/Apple)
4. Configure CDN for media files (optional)

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Recommended Hosting
- **Vercel**: Seamless Next.js deployment
- **Netlify**: Static site hosting with serverless functions
- **Railway/Render**: Full-stack hosting with database

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Content Guidelines

### Audio Content
- 48 kHz, mono, AAC/Opus format
- Normalized to -16 LUFS
- Clear pronunciation by native speakers
- Background noise minimized

### Video Content
- 1080p → 720p/360p transcoding
- HLS streaming for adaptive quality
- Subtitles in VTT format
- Accessible design considerations

### Text Content
- Multi-language JSON structure
- Consistent orthography profiles
- IPA phonetic transcriptions (optional)
- Cultural context and explanations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Zazaki language community for content and feedback
- Open source libraries and frameworks used
- Contributors and testers

## Support

For support, email support@zazaki-app.com or create an issue in the repository.
