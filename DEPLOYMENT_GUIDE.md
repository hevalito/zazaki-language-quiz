# Zazaki Language Quiz - Deployment Guide

## 🚀 Deployment Status

✅ **GitHub Repository**: https://github.com/hevalito/zazaki-language-quiz
✅ **Netlify Deployment**: zazaki-language-quiz.netlify.app (or custom domain)

## 🔧 Production Environment Setup

### Required Environment Variables

Add these environment variables in your Netlify dashboard under **Site settings > Environment variables**:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://your-domain.netlify.app"

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

### Database Setup

1. **PostgreSQL Database**: Set up a PostgreSQL database (recommended: Supabase, Railway, or Neon)
2. **Run Migrations**: After setting DATABASE_URL, the Prisma schema will auto-migrate on first deployment
3. **Seed Data**: Consider adding initial course content through the admin interface

### Domain Configuration

1. **Custom Domain**: Configure your custom domain in Netlify settings
2. **SSL Certificate**: Netlify automatically provides SSL certificates
3. **DNS Settings**: Update your domain's DNS to point to Netlify

## 📱 PWA Features

The app is configured as a Progressive Web App with:
- ✅ Offline caching
- ✅ Add to home screen
- ✅ Service worker for background sync
- ✅ App manifest with icons

## 🔒 Security Features

- ✅ Security headers configured in netlify.toml
- ✅ CSRF protection
- ✅ XSS protection
- ✅ Content Security Policy
- ✅ Secure authentication with NextAuth.js v5

## 🎯 Performance Optimizations

- ✅ Static generation with Next.js 15
- ✅ Image optimization
- ✅ Code splitting
- ✅ CDN caching via Netlify
- ✅ Optimized bundle size

## 📊 Analytics & Monitoring

Consider adding:
- Google Analytics or Plausible for user analytics
- Sentry for error monitoring
- Uptime monitoring for availability

## 🚀 Deployment Workflow

1. **Development**: Make changes locally
2. **Commit**: `git add . && git commit -m "Your changes"`
3. **Push**: `git push origin main`
4. **Auto-Deploy**: Netlify automatically builds and deploys

## 🛠 Troubleshooting

### Build Issues
- Check build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Database Issues
- Verify DATABASE_URL is correct
- Check database connection and permissions
- Review Prisma schema for any conflicts

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check OAuth provider configurations
- Ensure NEXTAUTH_URL matches your domain

## 📚 Next Steps

1. **Content Creation**: Use the admin interface to create courses and questions
2. **User Testing**: Test the app on various devices and browsers
3. **Performance Monitoring**: Monitor Core Web Vitals and user engagement
4. **Feature Expansion**: Add more question types and gamification features

## 🎉 Success Metrics

Target KPIs from the original briefing:
- FTUE (First Time User Experience) under 60 seconds
- >70% Quiz completion rate per session
- D1 retention >30%
- NPS ≥40

---

**Repository**: https://github.com/hevalito/zazaki-language-quiz
**Live App**: https://zazaki-language-quiz.netlify.app
