@echo off
echo 🚀 Starting Elite Games Backend (Strapi)...
echo 📍 Navigating to backend directory...

cd /d "%~dp0apps\backend"

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🏃‍♂️ Starting backend server...
echo 🌐 Backend will be available at: http://localhost:1337
echo ⚙️  Admin panel will be available at: http://localhost:1337/admin
echo.

npm run develop
pause 