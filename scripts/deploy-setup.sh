#!/bin/bash

echo "🚀 Zazaki Game - Post-Deployment Setup"
echo "======================================"

# Check if we're in Railway environment
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    echo "⚠️  This script should be run in Railway environment"
    echo "   Use: railway run ./scripts/deploy-setup.sh"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npm run db:generate

echo "🗄️  Pushing database schema..."
npm run db:push

echo "🌱 Seeding database with initial content..."
npm run db:seed

echo "🧪 Testing database connection..."
curl -s "$RAILWAY_PUBLIC_DOMAIN/api/db-test" | jq '.'

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "🔗 Your app: $RAILWAY_PUBLIC_DOMAIN"
echo "🔗 Admin panel: $RAILWAY_PUBLIC_DOMAIN/admin"
echo "🔗 DB test: $RAILWAY_PUBLIC_DOMAIN/api/db-test"
echo ""
echo "📋 Next steps:"
echo "1. Set up Google OAuth credentials"
echo "2. Add environment variables in Railway dashboard"
echo "3. Test authentication and admin access"
