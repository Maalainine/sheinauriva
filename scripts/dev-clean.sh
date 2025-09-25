#!/bin/bash

# Clean Development Server Script
# This ensures only one development server runs on port 3000

echo "🧹 Cleaning up any existing development servers..."

# Kill any existing Next.js development servers
pkill -f "next.*dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Check if port 3000 is still in use
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is still in use. Killing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "✅ Environment cleaned. Starting development server on port 3000..."

# Start the development server
npm run dev
