#!/bin/bash

echo "🎮 Starting Elite Games Frontend (Next.js)..."
echo "📍 Navigating to frontend directory..."

cd "$(dirname "$0")/apps/frontend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🏃‍♂️ Starting frontend server..."
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "👤 User demo: user@example.com / password"
echo "⭐ Premium demo: premium@example.com / password"
echo "🔑 Admin portal: http://localhost:3000/admin"
echo ""

npm run dev 