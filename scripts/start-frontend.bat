@echo off
echo 🎮 Starting Elite Games Frontend (Next.js)...
echo 📍 Navigating to frontend directory...

cd /d "%~dp0apps\frontend"

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🏃‍♂️ Starting frontend server...
echo 🌐 Frontend will be available at: http://localhost:3000
echo 👤 User demo: user@elitegames.com / Passw0rd
echo ⭐ Premium demo: premium@elitegames.com / Passw0rd
echo 🔑 Admin portal: http://localhost:3000/admin
echo.

npm run dev
pause 