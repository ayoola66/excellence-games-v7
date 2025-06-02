# Elite Games Trivia Platform

A comprehensive trivia gaming platform built with Next.js 14 and Strapi CMS, featuring multi-tier admin management, premium subscriptions, and custom music uploads.

## 🎯 Project Overview

Elite Games is an interactive trivia platform offering two distinct game types:
- **Straight Trivia**: Category-based question games
- **Nested Card Games**: Dice-roll card selection with themed questions (6 cards, card 6 is special)

## ✨ Key Features

### User Features
- **Free Tier**: Access to free games and basic functionality
- **Premium Tier**: Full game access + custom music upload (5MB) + ad-free experience
- **Progress Tracking**: Question history and performance analytics
- **British English**: All content follows British spelling and terminology
- **Responsive Design**: Mobile-first, desktop-optimized interface

### Admin Management (5-Tier Hierarchy)
- **Super Admin (SA)**: Complete system control + financial data
- **Dev Admin (DEV)**: Development features + limited admin control
- **Shop Admin (SH)**: Shop management + inventory control
- **Content Admin (CT)**: Content creation + trivia management
- **Customer Admin (CS)**: User management + customer service

### Technical Features
- **Authentication**: JWT-based with single-device session enforcement
- **Background Music**: Admin uploads (10MB) + premium user uploads (5MB)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Payment**: Stripe integration for premium subscriptions

## 🚀 Quick Start

### Prerequisites
- Node.js 18-20 (Strapi requirement)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd targeted
   ```

2. **Install Backend Dependencies**
   ```bash
   cd files/apps/backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development Setup

1. **Start the Backend (Strapi)**
   ```bash
   cd files/apps/backend
   npm run develop
   ```
   - Backend runs on http://localhost:1337
   - Admin panel: http://localhost:1337/admin

2. **Start the Frontend (Next.js)**
   ```bash
   cd files/apps/frontend
   npm run dev
   ```
   - Frontend runs on http://localhost:3000

## 🎮 Demo Credentials

### User Accounts
- **Free User**: `user@example.com` / `password`
- **Premium User**: `premium@example.com` / `password`

### Admin Accounts
- **Super Admin**: `superadmin@targetedgames.com` / `SuperAdmin2024!`
- **Dev Admin**: `devadmin@targetedgames.com` / `DevAdmin2024!`
- **Content Admin**: `contentadmin@targetedgames.com` / `ContentAdmin2024!`

Access admin portal at: http://localhost:3000/admin

## 🎯 Game Types Explained

### Straight Trivia Games
- Direct category selection
- Sequential question presentation
- No repeats until category exhausted
- Examples: "General Knowledge", "Science & Technology"

### Nested Card Games
- 6-card system with dice rolling
- Cards 1-5: Themed question pools
- Card 6: Special card (no questions)
- Example: "Sports Spectacular" with Football, Basketball, Tennis, Cricket, Golf cards

## 📱 User Journey

1. **Homepage**: Browse available games with access indicators
2. **Authentication**: Sign in/register with comprehensive validation
3. **Game Selection**: Choose between free/premium games based on subscription
4. **Gameplay**: 
   - Straight: Select category → Answer questions
   - Nested: Roll dice → Land on card → Answer themed questions
5. **Profile Management**: Track progress, manage subscription, upload music
6. **Admin Portal**: Role-based access to platform management

## 🔧 Architecture

### Frontend (Next.js 14)
- **Framework**: App Router with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context for authentication
- **UI Components**: Headless UI + Heroicons
- **Animations**: Framer Motion

### Backend (Strapi 4.25.0)
- **CMS**: Headless CMS with custom controllers
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT with custom admin system
- **File Upload**: Local provider with size limits
- **API**: RESTful with relationship population

### Key Components
- **AuthContext**: Handles user/admin authentication
- **GameCard**: Interactive game selection with access control
- **GamePage**: Main gameplay interface for both game types
- **ProfilePage**: User dashboard with subscription management
- **AdminPage**: Role-based admin dashboard

## 🎵 Music System

### Admin Background Music
- 10MB upload limit per track
- Rotation system for gameplay
- Admin-controlled activation

### Premium User Music
- 1 custom track per premium user
- 5MB upload limit
- Personal background music during games

## 💳 Subscription Model

### Free Tier
- Access to free games only
- No music upload capability
- Advertisement placement (future roadmap)

### Premium Tier
- £9.99/month via Stripe
- Access to all games
- 1 custom music upload (5MB)
- Ad-free experience
- Priority support

## 🛡️ Security Features

- **Session Management**: Single-device enforcement
- **Input Validation**: Comprehensive form validation
- **File Upload Security**: Type and size restrictions
- **Role-Based Access**: Hierarchical admin permissions
- **Password Requirements**: Strong password enforcement

## 📊 Admin Permissions Matrix

| Feature | SA | DEV | SH | CT | CS |
|---------|----|----|----|----|----| 
| Manage Trivia | ✅ | ✅ | ❌ | ✅ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage Admins | ✅ | Limited | ❌ | ❌ | ❌ |
| Manage Music | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Shop | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ✅ | ✅ |
| Financial Data | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🌐 Deployment

### Production Environment
- **Platform**: Railway (recommended)
- **Database**: PostgreSQL
- **File Storage**: Local provider (configurable to cloud)
- **Environment Variables**: Configure API URLs, Stripe keys, database connections

### Environment Configuration
```bash
# Backend (.env)
DATABASE_HOST=your-postgres-host
DATABASE_NAME=targeted_games
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=your-stripe-secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=your-backend-url
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 🚧 Future Roadmap

- [ ] Real-time multiplayer competitions
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] AI-powered question generation
- [ ] Social features and leaderboards
- [ ] Advanced music mixing system
- [ ] Multiple language support

## 📄 License

This project is part of the Max Targeted Games platform development.

## 🤝 Contributing

1. Follow British English conventions
2. Maintain responsive design principles
3. Ensure mobile-first approach
4. Add comprehensive error handling
5. Include proper TypeScript typing

---

**Built with ❤️ using Next.js 14, Strapi CMS, and modern web technologies.**