#!/bin/bash

# Navigate to the frontend directory
cd "$(dirname "$0")/../apps/frontend"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the Next.js development server
echo "Starting Next.js server..."
npm run dev 