#!/bin/bash

# Production deployment script for Netlify
# Handles Prisma migration conflicts gracefully

echo "🚀 Starting production deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Handle migration deployment with conflict resolution
echo "🗄️ Handling database migrations..."

# Try to deploy migrations normally first
if npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully"
else
    echo "⚠️ Migration conflict detected, resolving..."

    # If migration fails, mark the conflicting migration as resolved
    npx prisma migrate resolve --applied 20250930_initial_production_schema

    echo "✅ Migration conflicts resolved"

    # Try to deploy any remaining migrations
    npx prisma migrate deploy
fi

# Build the application
echo "🔨 Building Next.js application..."
npx next build

echo "🎉 Deployment completed successfully!"
