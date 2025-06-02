#!/bin/bash

echo "🚀 Starting Elite Games Backend (Strapi)..."
echo "📍 Navigating to backend directory..."

cd "$(dirname "$0")/apps/backend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🏃‍♂️ Starting backend server..."
echo "🌐 Backend will be available at: http://localhost:1337"
echo "⚙️  Admin panel will be available at: http://localhost:1337/admin"
echo ""

npm run develop 