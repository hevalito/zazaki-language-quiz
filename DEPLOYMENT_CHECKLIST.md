# 🚀 Zazaki Game - Railway Deployment Checklist

Follow this checklist step by step to deploy your Zazaki Game to Railway.

## ✅ Pre-Deployment Checklist

### 1. **YOU DO**: Set up Google OAuth
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing one
- [ ] Enable "Google+ API" 
- [ ] Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
- [ ] Application type: "Web application"
- [ ] Add authorized redirect URIs:
  - `https://your-app-name.railway.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID and Client Secret (you'll need these)

### 2. **YOU DO**: Railway Project Setup
- [ ] Go to [Railway Dashboard](https://railway.app/dashboard)
- [ ] Create new project or select existing
- [ ] Connect your GitHub repository
- [ ] Add PostgreSQL database service:
  - Click "New Service" → "Database" → "PostgreSQL"
  - Railway will auto-generate DATABASE_URL

### 3. **YOU DO**: Set Environment Variables
In Railway dashboard, go to your app service → Variables tab and add:

```bash
# Required - Authentication
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long

# Required - Google OAuth (from step 1)
GOOGLE_CLIENT_ID=your-google-client-id-from-step-1
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-step-1

# Optional - Email (for magic links)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Important**: Replace `your-app-name` with your actual Railway app name!

## 🚀 Deployment Steps

### 4. **AUTOMATIC**: Initial Deployment
- [ ] Push your code to GitHub (Railway will auto-deploy)
- [ ] Wait for build to complete
- [ ] Check deployment logs for any errors

### 5. **YOU DO**: Database Setup
After successful deployment, run these commands in Railway terminal:

```bash
# Option A: Use Railway CLI (recommended)
railway login
railway link your-project-id
railway run npm run db:push
railway run npm run db:seed

# Option B: Use Railway dashboard terminal
# Go to your app service → Terminal tab and run:
npm run db:push
npm run db:seed
```

### 6. **TEST**: Verify Deployment
- [ ] Visit: `https://your-app-name.railway.app/api/db-test`
- [ ] Should show: `{"status": "connected", "data": {"users": 1, "courses": 1, "questions": 3}}`
- [ ] If error, check DATABASE_URL is set correctly

### 7. **TEST**: Authentication
- [ ] Visit: `https://your-app-name.railway.app`
- [ ] Should show welcome/login screen (not direct app access)
- [ ] Try signing in with Google
- [ ] Should redirect to home screen after login

### 8. **TEST**: Admin Panel
- [ ] Sign in with Google using email: `admin@zazaki-game.com`
- [ ] Visit: `https://your-app-name.railway.app/admin`
- [ ] Should show admin dashboard with statistics
- [ ] If access denied, check user has `isAdmin: true` in database

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if DATABASE_URL is set
railway run echo $DATABASE_URL

# Test database connection
railway run npm run db:generate
railway run npm run db:push
```

### Authentication Issues
- [ ] Verify NEXTAUTH_URL matches your Railway domain exactly
- [ ] Check Google OAuth redirect URIs include your Railway domain
- [ ] Ensure NEXTAUTH_SECRET is at least 32 characters

### Admin Access Issues
```bash
# Make any user admin via Railway database console
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

## 📋 Post-Deployment Tasks

### 9. **YOU DO**: Content Management
- [ ] Access admin panel: `/admin`
- [ ] Create additional courses and lessons
- [ ] Add more questions to quizzes
- [ ] Publish content for users

### 10. **VERIFY**: Full Functionality
- [ ] User registration/login works
- [ ] Course content displays correctly
- [ ] Quiz functionality works
- [ ] Progress tracking works
- [ ] Admin panel fully functional

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ `/api/db-test` returns connected status
- ✅ Authentication required (no direct app access)
- ✅ Admin panel accessible at `/admin`
- ✅ Real content displays (not demo data)
- ✅ Users can take quizzes and track progress

## 🆘 Need Help?

If you encounter issues:
1. Check Railway deployment logs
2. Test `/api/db-test` endpoint
3. Verify all environment variables are set
4. Check Google OAuth configuration
5. Review database connection and seeding

---

**Current Status**: Ready for deployment! All code changes are complete.
