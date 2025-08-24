# 🚀 Step-by-Step Railway Deployment Guide

Follow these exact steps to complete your Zazaki Game deployment.

## 📋 STEP 1: Set Up Google OAuth (Do This First)

### 1.1 Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create or Select Project
1. Click the project dropdown at the top
2. Either select existing project or click "New Project"
3. If creating new: Enter name like "Zazaki Game" → Create

### 1.3 Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" → Enable it
3. Also enable "Google Identity" if available

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: "Zazaki Game"
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

### 1.5 Configure OAuth Client
1. Application type: "Web application"
2. Name: "Zazaki Game Web Client"
3. Authorized redirect URIs → Add URI:
   ```
   https://loyal-quietude-production.up.railway.app/api/auth/callback/google
   ```
4. Click "Create"
5. **COPY AND SAVE**: Client ID and Client Secret (you'll need these next!)

---

## 📋 STEP 2: Add PostgreSQL Database to Railway

### 2.1 Go to Railway Dashboard
1. Open [Railway Dashboard](https://railway.app/dashboard)
2. Find your project: "zazaki-language-quiz"
3. Click on it

### 2.2 Add Database Service
1. Click "New Service" button
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will create the database automatically
5. Wait for it to deploy (green status)

---

## 📋 STEP 3: Set Environment Variables in Railway

### 3.1 Go to Your App Service
1. In Railway dashboard, click on your main service (not the database)
2. Click "Variables" tab

### 3.2 Add Required Variables
Click "New Variable" for each of these:

**Variable 1:**
- Name: `NEXTAUTH_URL`
- Value: `https://loyal-quietude-production.up.railway.app`

**Variable 2:**
- Name: `NEXTAUTH_SECRET`
- Value: `zazaki-game-super-secret-key-for-production-2024-minimum-32-chars`

**Variable 3:**
- Name: `GOOGLE_CLIENT_ID`
- Value: [Paste the Client ID from Step 1.5]

**Variable 4:**
- Name: `GOOGLE_CLIENT_SECRET`
- Value: [Paste the Client Secret from Step 1.5]

### 3.3 Deploy Changes
1. After adding all variables, Railway will automatically redeploy
2. Wait for deployment to complete (green status)

---

## 📋 STEP 4: Set Up Database Schema

### 4.1 Open Railway Terminal
1. In Railway dashboard, go to your main service
2. Click "Terminal" tab
3. Wait for terminal to load

### 4.2 Run Database Commands
Copy and paste these commands one by one:

```bash
npm run db:push
```
Wait for it to complete, then:

```bash
npm run db:seed
```

---

## 📋 STEP 5: Test Your Deployment

### 5.1 Test Database Connection
1. Open: `https://loyal-quietude-production.up.railway.app/api/db-test`
2. Should show: `{"status": "connected", "data": {"users": 1, "courses": 1, "questions": 3}}`

### 5.2 Test Main App
1. Open: `https://loyal-quietude-production.up.railway.app`
2. Should show welcome/login screen (not 404!)
3. Click "Sign in with Google"
4. Should redirect to Google login

### 5.3 Test Admin Panel
1. Sign in with Google using email: `admin@zazaki-game.com`
2. Visit: `https://loyal-quietude-production.up.railway.app/admin`
3. Should show admin dashboard with statistics

---

## 🎉 SUCCESS CRITERIA

Your deployment is complete when:
- ✅ No 404 errors on main page
- ✅ Google login works
- ✅ Database test shows connected status
- ✅ Admin panel accessible
- ✅ Real content displays (not demo data)

---

## 🆘 If Something Goes Wrong

### App Still Shows 404
- Check all environment variables are set correctly
- Make sure Railway redeployed after adding variables

### Database Connection Failed
- Ensure PostgreSQL service is running in Railway
- Check DATABASE_URL is automatically set

### Google Login Not Working
- Verify redirect URI in Google Cloud Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

---

**Start with Step 1 (Google OAuth) and let me know when you complete each step!**
