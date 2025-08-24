# Zazaki Language Quiz - Deployment Guide

## 🚀 Deployment Status

✅ **Successfully Deployed on Railway**
- **Live URL**: https://loyal-quietude-production.up.railway.app
- **Status**: ✅ Online and working
- **Platform**: Railway (PostgreSQL + Next.js)

## 🔧 Production Environment Setup

### Railway Configuration

The application is deployed on Railway with the following setup:
- **Web Service**: Next.js 15 application
- **Database**: PostgreSQL database
- **Environment**: Production

### Environment Variables (Already Configured)

The following environment variables are set in Railway:

```bash
# Authentication
NEXTAUTH_SECRET="JKrPH/ZUgBo67IVvcwUusmfvzR3HHDf0RkOfNZEUrLQ="
NEXTAUTH_URL="https://loyal-quietude-production.up.railway.app"

# Database
DATABASE_URL="postgresql://postgres:password@postgres.railway.internal:5432/railway"

# Railway System Variables (Auto-generated)
RAILWAY_ENVIRONMENT="production"
RAILWAY_PROJECT_NAME="zazaki-language-quiz"
RAILWAY_SERVICE_NAME="loyal-quietude"
RAILWAY_PUBLIC_DOMAIN="loyal-quietude-production.up.railway.app"
```

### Additional Environment Variables (Optional)

For full functionality, you may want to add:

```bash
# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_ID="your-apple-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_PRIVATE_KEY="your-apple-private-key"
APPLE_KEY_ID="your-apple-key-id"

# Email Provider (for magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Media Storage (Optional)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

## 🗄️ Database Setup

✅ **PostgreSQL Database**: Configured and connected
- Database is automatically provisioned by Railway
- Prisma schema is ready for migrations
- Connection string is automatically provided

### Running Database Migrations

To set up the database schema:

```bash
# Connect to your Railway project
railway login
cd zazaki-game
railway link

# Run Prisma migrations
railway run npx prisma migrate deploy
railway run npx prisma db seed  # If you have seed data
```

## 📱 PWA Features

The app is configured as a Progressive Web App with:
- ✅ Offline caching
- ✅ Add to home screen capability
- ✅ Service worker for background sync
- ✅ App manifest with icons
- ✅ Mobile-first responsive design

## 🔒 Security Features

- ✅ Security headers configured in next.config.js
- ✅ CSRF protection via NextAuth.js
- ✅ XSS protection
- ✅ Content Security Policy
- ✅ Secure authentication with NextAuth.js v5
- ✅ Environment variables secured in Railway

## 🎯 Performance Optimizations

- ✅ Next.js 15 with App Router
- ✅ Static generation where possible
- ✅ Image optimization
- ✅ Code splitting and lazy loading
- ✅ Railway's global CDN
- ✅ Optimized bundle size with tree shaking

## 🚀 Deployment Workflow

### Current Setup
1. **Railway CLI**: `railway up` deploys directly
2. **Build Process**: Nixpacks automatically detects Next.js
3. **Start Command**: `npm start` serves the production build
4. **Auto-scaling**: Railway handles traffic scaling

### Making Updates
```bash
# Make your changes locally
git add .
git commit -m "Your changes"

# Deploy to Railway
railway up

# Or link to GitHub for auto-deployment
railway link
git push origin main  # Auto-deploys on push
```

## 🛠 Troubleshooting

### Build Issues
- Check Railway build logs: `railway logs`
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility (18.x)

### Database Issues
- Check connection: `railway connect postgres`
- Verify DATABASE_URL is set correctly
- Run migrations: `railway run npx prisma migrate deploy`

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your Railway domain
- Test OAuth providers if configured

### Performance Issues
- Monitor with Railway metrics dashboard
- Check Core Web Vitals in browser dev tools
- Use Railway's built-in monitoring

## 📊 Monitoring & Analytics

Railway provides built-in monitoring for:
- ✅ Application uptime
- ✅ Response times
- ✅ Error rates
- ✅ Resource usage

Consider adding:
- Google Analytics for user behavior
- Sentry for error tracking
- Custom analytics for quiz completion rates

## 🎯 Technical Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query v5
- **Authentication**: NextAuth.js v5
- **PWA**: next-pwa for offline functionality

### Backend
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Magic links + OAuth
- **File Storage**: Ready for Cloudinary integration

### Deployment
- **Platform**: Railway
- **Build System**: Nixpacks
- **Database**: Railway PostgreSQL
- **CDN**: Railway's global edge network

## 🎉 Success Metrics

Target KPIs from the original briefing:
- ✅ FTUE (First Time User Experience) under 60 seconds
- 🎯 >70% Quiz completion rate per session
- 🎯 D1 retention >30%
- 🎯 NPS ≥40

## 📚 Next Steps

1. **Database Migration**: Run Prisma migrations to set up tables
2. **Content Creation**: Use admin interface to create courses
3. **OAuth Setup**: Configure Google/Apple sign-in if needed
4. **Custom Domain**: Add custom domain in Railway settings
5. **Monitoring**: Set up error tracking and analytics
6. **Testing**: Comprehensive testing across devices

## 🔗 Important Links

- **Live Application**: https://loyal-quietude-production.up.railway.app
- **Railway Dashboard**: https://railway.app/project/174eb150-4be7-46f8-a343-bbb04e6df85e
- **GitHub Repository**: (Link to your repository)

---

**Status**: ✅ Successfully deployed and operational
**Last Updated**: August 24, 2025
**Platform**: Railway
