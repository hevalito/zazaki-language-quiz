#!/bin/bash

# Use the public database URL for database operations
export DATABASE_URL="postgresql://postgres:UhELRGzeeQhXVAukJUXpooDiwjLbyenZ@trolley.proxy.rlwy.net:42748/railway"

echo "Using public DATABASE_URL for setup..."
echo "Running db:push..."
npx prisma db push

echo "Running db:seed..."
npm run db:seed
