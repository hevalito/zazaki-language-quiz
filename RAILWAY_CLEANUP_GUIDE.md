# 🧹 Railway Database Cleanup & Connection Guide

## Current Situation
- You have 2 PostgreSQL databases in Railway
- Need to remove the old/unused one
- Need to properly connect the correct database to your app service

## 📋 Step 1: Identify Which Database to Keep

### 1.1 Go to Railway Dashboard
1. Open [Railway Dashboard](https://railway.app/dashboard)
2. Find your project: "zazaki-language-quiz"
3. Click on it to see all services

### 1.2 Identify Your Services
You should see:
- **Main App Service** (your Zazaki app)
- **PostgreSQL Database 1** (older one)
- **PostgreSQL Database 2** (newer one)

### 1.3 Check Which Database is Connected
1. Click on your **main app service** (not the databases)
2. Go to "Variables" tab
3. Look for `DATABASE_URL` variable
4. Note which database it points to (the URL will contain the database service name)

---

## 📋 Step 2: Remove the Old Database

### 2.1 Identify the Unused Database
- The database that is NOT referenced in your `DATABASE_URL` variable
- Usually the older one or one with no connections

### 2.2 Delete the Old Database
1. Click on the **old/unused database service**
2. Go to "Settings" tab
3. Scroll down to "Danger Zone"
4. Click "Delete Service"
5. Type the service name to confirm
6. Click "Delete"

⚠️ **Warning**: Make sure you're deleting the RIGHT database! Check the `DATABASE_URL` first.

---

## 📋 Step 3: Properly Connect the Remaining Database

### 3.1 Method A: Automatic Connection (Recommended)
1. Click on your **main app service**
2. Go to "Variables" tab
3. If `DATABASE_URL` is already there and points to the correct database, you're done!

### 3.2 Method B: Manual Connection (if needed)
1. Click on your **PostgreSQL database service**
2. Go to "Connect" tab
3. Copy the "Database URL" (starts with `postgresql://`)
4. Go to your **main app service**
5. Go to "Variables" tab
6. If `DATABASE_URL` exists, edit it. If not, create new variable:
   - Name: `DATABASE_URL`
   - Value: [paste the database URL you copied]

### 3.3 Method C: Service Linking (Alternative)
1. Click on your **main app service**
2. Go to "Settings" tab
3. Look for "Service Connections" or "Connected Services"
4. Click "Connect Service"
5. Select your PostgreSQL database
6. Railway will automatically create the `DATABASE_URL` variable

---

## 📋 Step 4: Verify Connection

### 4.1 Check Variables
1. In your main app service → Variables tab
2. Confirm `DATABASE_URL` exists and looks like:
   ```
   postgresql://postgres:password@hostname:5432/railway
   ```

### 4.2 Test Connection
1. Wait for your app to redeploy (should happen automatically)
2. Visit: `https://loyal-quietude-production.up.railway.app/api/db-test`
3. Should show connection status

---

## 📋 Step 5: Set Up Database Schema (After Connection)

Once the database is properly connected:

### 5.1 Use the Setup API
1. Visit: `https://loyal-quietude-production.up.railway.app/api/setup-db`
2. Use POST method (you can use browser dev tools or curl)
3. This will create all tables and seed initial data

### 5.2 Alternative: Railway Terminal
1. Go to your main app service → Terminal
2. Run: `npm run db:push`
3. Then: `npm run db:seed`

---

## 🎯 Expected Result

After cleanup, you should have:
- ✅ 1 PostgreSQL database service
- ✅ 1 main app service
- ✅ `DATABASE_URL` variable properly set
- ✅ Database connection working
- ✅ Schema and data properly set up

---

## 🆘 Troubleshooting

### "Can't reach database server"
- Check `DATABASE_URL` is correct
- Ensure database service is running (green status)
- Try reconnecting the services

### "Database not found"
- The database might be empty
- Run the setup API or database commands

### Multiple DATABASE_URL variables
- Remove duplicates, keep only one
- Ensure it points to the correct database

---

**Start with Step 1 to identify your current setup, then let me know what you see!**
