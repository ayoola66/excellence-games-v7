#!/bin/bash

echo "🚀 Starting Elite Games Development Servers..."
echo ""

# Function to start backend
start_backend() {
    echo "📦 Starting Strapi Backend (Port 1337)..."
    cd apps/backend
    npm run develop &
    BACKEND_PID=$!
    cd ../..
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend  
start_frontend() {
    echo "🎨 Starting Next.js Frontend (Port 3000)..."
    cd apps/frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ../..
    echo "Frontend PID: $FRONTEND_PID"
}

# Function to stop servers
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "Servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
start_backend
sleep 3
start_frontend

echo ""
echo "✅ Development servers started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:1337"
echo "📊 Admin:    http://localhost:1337/admin"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user input
wait 