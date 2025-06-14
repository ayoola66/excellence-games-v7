# 🚀 Elite Games - Quick Setup Guide

## 📁 Current Directory Structure
```
targeted/
├── files/
│   ├── README.md                 (Full documentation)
│   ├── SETUP-GUIDE.md           (This file)
│   ├── start-backend.sh         (Mac/Linux script)
│   ├── start-frontend.sh        (Mac/Linux script)
│   ├── start-backend.bat        (Windows script)
│   ├── start-frontend.bat       (Windows script)
│   └── apps/
│       ├── backend/             (Strapi CMS - Port 1337)
│       └── frontend/            (Next.js - Port 3000)
```

## 🎯 Quick Start (3 Methods)

### Method 1: Using Startup Scripts (Easiest)

**Mac/Linux:**
```bash
# Terminal 1 - Start Backend
cd files
./start-backend.sh

# Terminal 2 - Start Frontend  
cd files
./start-frontend.sh
```

**Windows:**
```bash
# Terminal 1 - Start Backend
cd files
start-backend.bat

# Terminal 2 - Start Frontend
cd files  
start-frontend.bat
```

### Method 2: Manual Navigation
```bash
# Terminal 1 - Backend
cd files/apps/backend
npm install
npm run develop

# Terminal 2 - Frontend
cd files/apps/frontend  
npm install
npm run dev
```

### Method 3: Direct Commands (from project root)
```bash
# Terminal 1 - Backend
cd files/apps/backend && npm install && npm run develop

# Terminal 2 - Frontend
cd files/apps/frontend && npm install && npm run dev
```

## 🌐 Access Points

Once both servers are running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main trivia game interface |
| **Admin Portal** | http://localhost:3000/admin | Admin management dashboard |
| **Backend API** | http://localhost:1337 | Strapi CMS API |
| **Strapi Admin** | http://localhost:1337/admin | Strapi content management |

## 🎮 Demo Accounts

### User Accounts (Frontend)
- **Free User**: `user@example.com` / `password`
- **Premium User**: `premium@example.com` / `password`

### Admin Accounts (Admin Portal)
- **Super Admin**: `superadmin@targetedgames.com` / `SuperAdmin2024!`
- **Dev Admin**: `devadmin@targetedgames.com` / `DevAdmin2024!`
- **Content Admin**: `contentadmin@targetedgames.com` / `ContentAdmin2024!`

## 🎲 Game Types to Test

1. **Straight Trivia**: "General Knowledge Challenge" (Free)
2. **Nested Cards**: "Sports Spectacular" (Premium - need premium account)

## 🔧 Troubleshooting

### Common Issues:

**"Cannot find module" errors:**
```bash
# Delete node_modules and reinstall
cd files/apps/backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend  
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Kill processes on ports
npx kill-port 3000 1337
```

**Navigation confusion:**
- Always start from the `targeted/` root directory
- Use `pwd` to check current location
- Use `ls` to see available folders

### Getting Your Bearings:
```bash
# Check current directory
pwd

# List contents
ls -la

# Navigate to project root
cd targeted

# Then use the scripts or manual navigation
```

## 📱 Testing the Platform

1. **Start both servers** using any method above
2. **Visit http://localhost:3000** for the main site
3. **Try user registration** or use demo accounts
4. **Play free games** without login
5. **Login as premium user** to access premium games
6. **Visit admin portal** to test admin features
7. **Test game mechanics** (dice rolling, question answering)

## 🆘 Need Help?

If you're still having trouble:

1. **Check you're in the right directory**: `pwd` should show your project path
2. **Verify Node.js version**: `node --version` (should be 18-20)
3. **Check if ports are free**: `lsof -i :3000` and `lsof -i :1337`
4. **Review error messages** in terminal output

## 🎉 Success Indicators

✅ Backend running: "Welcome back! To manage your content, go to..."  
✅ Frontend running: "Local: http://localhost:3000"  
✅ Can access homepage with game cards  
✅ Can login with demo credentials  
✅ Games are playable with questions loading  

---

**Happy Gaming! 🎮** 