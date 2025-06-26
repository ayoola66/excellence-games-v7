#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")/../apps/backend"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the Strapi development server
echo "Starting Strapi server..."
npm run develop 