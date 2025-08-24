# Railway Database Setup Guide

## Current Issue
The `DATABASE_URL` is pointing to an old/non-working PostgreSQL instance:
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

## Available PostgreSQL Instances
Based on the Railway variables, you have:

1. **Old/Broken Instance**: `postgres.railway.internal:5432` (not accessible)
2. **Working Instance**: `postgres-production-687ff.up.railway.app` (accessible)

## Steps to Fix in Railway Dashboard

### 1. Access Railway Dashboard
- Go to your Railway project: `zazaki-language-quiz`
- Navigate to the `loyal-quietude` service

### 2. Database Linking
In the Railway dashboard:

1. **Go to Variables tab** of your `loyal-quietude` service
2. **Find the DATABASE_URL variable**
3. **Link it to the working PostgreSQL service** that corresponds to `postgres-production-687ff.up.railway.app`

### 3. Remove Old Database Reference
1. **Unlink/remove** any references to the old `postgres.railway.internal:5432` database
2. **Delete the old PostgreSQL service** if it exists and is not being used

### 4. Verify New DATABASE_URL
After linking, the `DATABASE_URL` should automatically update to something like:
```
postgresql://postgres:[password]@postgres-production-687ff.up.railway.app:5432/railway
```

## Which PostgreSQL Instance to Use

**Use the PostgreSQL service that shows up as:**
- Service name: `postgres` or similar
- URL: `postgres-production-687ff.up.railway.app`
- This is the working instance I added with `railway add --database postgres`

## After Linking

Once you've linked the correct database in the Railway dashboard:

1. **Redeploy your service** (if needed)
2. **Test the connection** by running:
   ```bash
   railway run npm run db:push
   ```
3. **Set up the database schema and seed data**

## Next Steps After Database is Connected

1. ✅ Push database schema: `railway run npm run db:push`
2. ✅ Seed the database: `railway run npm run db:seed`
3. ✅ Test the application
4. ✅ Access admin panel at `/admin`

## Troubleshooting

If you still have issues after linking:
1. Check that the PostgreSQL service is running in Railway
2. Verify the DATABASE_URL environment variable is updated
3. Try redeploying the service
4. Check Railway logs for any connection errors

---

**Important**: Make sure to use the PostgreSQL instance with URL `postgres-production-687ff.up.railway.app` - this is the working one!
