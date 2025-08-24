# Zazaki Game - Railway Deployment Setup Guide

This guide will help you properly set up the Zazaki Game on Railway with database connection, authentication, and admin panel access.

## 🚨 Current Issues Identified

1. **Database Connection**: Not properly configured in Railway
2. **Authentication**: Users bypass login screen (demo mode)
3. **Admin Panel**: Missing - now created but needs database setup
4. **Content**: No real content, only demo data

## 📋 Prerequisites

- Railway account
- Google OAuth credentials (for authentication)
- PostgreSQL database (Railway provides this)

## 🔧 Step 1: Railway Environment Variables

In your Railway project dashboard, set these environment variables:

### Required Variables
```bash
# Database (Railway will provide this automatically)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL="https://your-app-name.railway.app"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"

# Google OAuth (required for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Email provider for magic links
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Optional: Media storage
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

## 🗄️ Step 2: Database Setup

### 2.1 Add PostgreSQL Service
1. In Railway dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provide the `DATABASE_URL`

### 2.2 Run Database Migrations
After deployment, run these commands in Railway's terminal or locally:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial content
npm run db:seed
```

## 🔐 Step 3: Google OAuth Setup

### 3.1 Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://your-app-name.railway.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

### 3.2 Configure OAuth
- Copy Client ID and Client Secret to Railway environment variables
- Make sure `NEXTAUTH_URL` matches your Railway app URL

## 👨‍💼 Step 4: Admin Access

### 4.1 Create Admin User
After database is seeded, the admin user will be created with:
- **Email**: `admin@zazaki-game.com`
- **Password**: Use Google OAuth to sign in

### 4.2 Access Admin Panel
1. Deploy the app with all environment variables
2. Visit: `https://your-app-name.railway.app/admin`
3. Sign in with Google using the admin email
4. You'll be redirected to the admin dashboard

### 4.3 Make Existing User Admin
If you want to make an existing user an admin, run this SQL in Railway's database console:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

## 🧪 Step 5: Testing Database Connection

### 5.1 Test API Endpoint
Visit: `https://your-app-name.railway.app/api/db-test`

This will show:
- Database connection status
- Number of users, courses, questions
- Any connection errors

### 5.2 Expected Response (Success)
```json
{
  "status": "connected",
  "message": "Database connection successful",
  "data": {
    "users": 1,
    "courses": 1,
    "questions": 3
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🚀 Step 6: Deployment Commands

### 6.1 Railway CLI Commands
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up

# Run database commands
railway run npm run db:push
railway run npm run db:seed
```

### 6.2 Manual Deployment
1. Connect your GitHub repository to Railway
2. Set all environment variables
3. Railway will automatically deploy on push

## 🔍 Step 7: Troubleshooting

### Database Connection Issues
1. Check `DATABASE_URL` is set correctly
2. Ensure PostgreSQL service is running
3. Test connection with `/api/db-test` endpoint

### Authentication Issues
1. Verify `NEXTAUTH_URL` matches your domain
2. Check Google OAuth credentials
3. Ensure `NEXTAUTH_SECRET` is set (min 32 characters)

### Admin Access Issues
1. Confirm user has `isAdmin: true` in database
2. Check admin middleware is working
3. Verify user is signed in with correct email

## 📝 Step 8: Content Management

### 8.1 Admin Panel Features
- **Dashboard**: Overview of users, courses, questions
- **Courses**: Create and manage learning courses
- **Questions**: Add quiz questions with multiple choice answers
- **Users**: View and manage user accounts

### 8.2 Creating Content
1. Access admin panel: `/admin`
2. Create courses with chapters and lessons
3. Add questions to quizzes
4. Publish content for users

## 🔄 Step 9: Replace Demo Content

The app currently shows hardcoded demo content. After setting up the database:

1. Real user progress will be tracked
2. Actual courses and lessons will be displayed
3. Quiz functionality will work with real questions
4. User authentication will be required

## ⚡ Quick Setup Checklist

- [ ] Railway PostgreSQL database added
- [ ] All environment variables set
- [ ] Google OAuth configured
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Admin user created
- [ ] `/api/db-test` returns success
- [ ] Admin panel accessible at `/admin`
- [ ] Authentication working (no direct app access)

## 🆘 Support

If you encounter issues:

1. Check Railway logs for errors
2. Test database connection with `/api/db-test`
3. Verify all environment variables are set
4. Ensure Google OAuth is properly configured

The admin panel provides a complete content management system for creating courses, lessons, and questions in the Zazaki language learning app.
