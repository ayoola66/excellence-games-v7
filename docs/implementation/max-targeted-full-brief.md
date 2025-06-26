
# Max Targeted Games - Complete Project Brief
## Comprehensive Trivia Game Platform with Admin Management System

---

## 🎯 **PROJECT OVERVIEW**

**Project Name**: Elite Games Trivia Platform  
**Platform Type**: Web-based Trivia Game with Admin CMS  
**Target Deployment**: Railway (Production) 
**Architecture**: Next.js Frontend + Strapi CMS Backend  
**Database**: PostgreSQL (Production) / SQLite (Development)  

### **Core Concept**
A comprehensive trivia game platform where users play interactive question-based games while administrators have full control over content management, user management, and system analytics. The platform supports both "straight" trivia categories and "nested" card-based games with sophisticated question management.

---

## 🎮 **GAME MECHANICS & USER EXPERIENCE**

### **Primary Game Types**

#### **1. Straight Trivia Games**
- **Structure**: Direct category-based questions
- **Examples**: "General Knowledge", "Science" 
- **Flow**: User selects category → Questions appear sequentially
- **Question Pool**: Randomized from category database
- **No Repeats**: Questions don't repeat until category pool exhausted

#### **2. Nested Card Games** 
- **Structure**: Games contain 5 themed cards, each with specific question pools. card 6 is s special card without no question
- **Example**: "Sports Trivia" game with cards:
  - Card 1: Football questions
  - Card 2: NBA questions  
  - Card 3: Cricket questions
  - Card 4: Golf questions
  - Card 5: Tennis questions
- **Flow**: User rolls dice → Lands on card → Answers question from that card's pool
- **Advanced Mechanics**: Each card maintains separate question tracking and are randomised on selection unil rame reset or question exhasution to start again

### **Core Gameplay Flow**
1. **Game Selection**: User browses available games with thumbnails
2. **Question Presentation**: Multiple choice (4 options)
3. **Answer Submission**: User selects option
4. **Reveal Phase**: Correct answer highlighted, explanation shown if added (optional)
5. **Progress Tracking**: No score tracking, question history
6. **Session Management**: No question repeats per session

### **User Interface Features**
- **Responsive Design**: Mobile-first, desktop-optimized
- **Visual Feedback**: Correct/incorrect animations and sounds
- **Background Music System**: Admin tracks upload 10mb/mp3 + Premium user uploads 1 song
- **Sound Effects**: Click, correct, incorrect, success sounds
- **British English**: All text follows British spelling/terminology

---

## 🔐 **USER MANAGEMENT & AUTHENTICATION**

### **User Types & Access Levels**

#### **Free Users**
- **Game Access**: only access free game categories
- **Music Upload**: 0 custom track
- **Features**: Basic gameplay, limited content
- **Advertisements**: Strategic ad placement between games (road map but add functionality)

#### **Premium Users** 
- **Game Access**: All categories and games
- **Music Upload**: 1 custom track (5MB each)
- **Features**: Ad-free experience, priority support
- **Billing**: Annual subscription via Stripe integration
- **Grace Period**: 1 week after payment failure before downgrade

### **Authentication System**
- **Email-Based Login**: Token-based authentication
- **Registration**: Full name, email, phone, delivery address
- **Password Reset**: Email token system (60-second expiry)
- **Session Management**: Single device enforcement
  - New login terminates previous session
  - Warning: "More than one active session noticed. See you on the other side!"
- **Multi-Device Prevention**: Automatic session termination

---

## 👑 **ADMIN MANAGEMENT SYSTEM**

### **Admin Hierarchy (High to Low Authority) RBAC**

#### **1. Super Admin (SA) - Highest Authority**
- **Email**: `superadmin@targetedgames.com`
- **Password**: Passw0rd
- **Access**: Complete system control
- **Badge**: Red "SA"
- **Capabilities**: 
  - Manage all admin types including Dev Admins
  - Access all system areas including Orders & Subscriptions
  - Financial data access

#### **2. Dev Admin (DEV) - Development Administrator**
- **Email**: `devadmin@targetedgames.com` 
- **Password**: Passw0rd
- **Access**: Full development features
- **Badge**: Black "DEV"
- **Capabilities**:
  - Trivia Management (full CRUD)
  - Shop Administration
  - User Management
  - Admin Management (limited - cannot manage other Dev/Super Admins)
  - Analytics & Reports
  - System Settings
- **Restrictions**: No access to Orders & Subscriptions

#### **3. Shop Admin (SH) - E-commerce Focus**
- **Email**: `shopadmin@targetedgames.com`
- **Password**: Passw0rd
- **Badge**: Green "SH"
- **Access**: Shop management, product catalog, inventory

#### **4. Content Admin (CT) - Content Management**
- **Email**: `contentadmin@targetedgames.com`
- **Password**: Passw0rd
- **Badge**: Purple "CT"  
- **Access**: Trivia content creation, question management

#### **5. Customer Admin (CS) - User Support**
- **Email**: `customeradmin@targetedgames.com`
- **Password**: Passw0rd
- **Badge**: Orange "CS"
- **Access**: User management, support analytics

### **Admin Panel Features**

#### **Trivia Management System**
- **Games Management**: 
  - Create/edit/delete trivia games
  - Upload game thumbnails
  - Set game type (straight/nested)
  - Configure premium/free status
- **Category Management**:
  - Straight categories for direct trivia
  - Nested game cards (1-6 per game)
  - Question count tracking per category
- **Question Management**:
  - Bulk import via CSV/Excel
  - Individual question CRUD operations
  - Multi-field search functionality
  - Difficulty levels (Easy/Medium/Hard)
  - Tag system for organization
  - Professional confirmation modals (no browser alerts)

#### **CSV Import System**
- **Structure**: Spreadsheet name = Game category
- **Tabs**: 1-6 tabs represent card categories
- **Format**: QUESTIONS | OPTION1 | OPTION2 | OPTION3 | OPTION4 | CORRECT_OPTION
- **Validation**: Automatic data validation and error reporting
- **Batch Processing**: Handle large question sets efficiently

#### **Music Management System**
- **Admin Music**: Up to 10 tracks (10MB each)
- **Rotation System**: Automatic track rotation during gameplay  
- **User Music**: Enable user uploads with file size limits
- **Volume Control**: 6-level system (0-5, max 50% to preserve FX)
- **Format Support**: MP3

#### **User Management**
- **User Database**: Complete user profiles with subscription status
- **Analytics**: User engagement, popular categories, conversion metrics
- **Support Tools**: User session management, progress tracking

#### **System Analytics**
- **Game Performance**: Question difficulty analysis, category popularity
- **User Metrics**: Engagement rates, session duration, conversion tracking
- **Revenue Analytics**: Subscription metrics, churn analysis
- **Geographic Distribution**: User location analytics

---

## 💰 **MONETIZATION & PAYMENT SYSTEM**

### **Subscription Model**
- **Annual Payment**: £X/year (board game purchase includes 1-year access)
- **Payment Processing**: Stripe integration with webhook handling
- **Board Game Integration**: Physical purchase grants digital access
- **Auto-Renewal**: Automatic billing with grace period
- **Failed Payment Handling**: 1-week grace period, then downgrade to free

### **Advertisement Strategy**
- **Free User Experience**: Strategic ad placement
- **Ad Types**: 
  - Display ads between games
  - Rewarded video for hints/extra features
  - Sponsored content integration
- **Premium Value**: Ad-free experience encourages upgrades

### **Coupon & Pricing Management**
- **Seasonal Vouchers**: Admin-created discount codes
- **Redemption Tracking**: Usage caps and expiration dates
- **Stripe Integration**: Automated coupon application

---

## 🔧 **TECHNICAL ARCHITECTURE**

### **Frontend Stack**
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks + Context API
- **Authentication**: JWT tokens with session management
- **File Uploads**: Multipart form handling with progress indicators

### **Backend Stack**
- **CMS**: Strapi (Headless CMS)
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **File Storage**: Strapi media library with CDN optimization
- **API**: RESTful endpoints with proper error handling

### **Database Schema**

#### **Core Entities**
```
Games:
- id, name, description, type (straight/nested)
- status (free/premium), thumbnail, totalQuestions

Categories: 
- id, name, description, difficulty, questionCount
- status (free/premium), gameId (for nested)

Questions:
- id, question, options[], correctAnswer, difficulty
- categoryId, gameId, gameCategoryId, explanation, tags

Users:
- id, email, name, phone, address, subscriptionStatus
- premiumExpiry, createdAt, lastLogin

Background-Music:
- id, title, audioFile, duration, isActive
- uploadedBy, fileSize, sortOrder

User-Music:
- id, userId, title, audioFile, uploadSlot
- isPremiumUser, duration, isActive

Music-Preferences:
- userId, musicEnabled, musicVolume
- preferUserMusic, selectedUserMusicId
```

### **API Endpoints Structure**
```
/api/get-games - Game listing with pagination
/api/get-category-with-questions - Question retrieval
/api/admin-data - Admin dashboard data
/api/upload-image - File upload handling
/api/upload-music - Music file management
/api/music-preferences - User music settings
/api/import-questions - Bulk question import
/api/database-stats - System analytics
```

---

## 🎨 **USER INTERFACE DESIGN**

### **Design Principles**
- **Mobile-First**: Responsive design for all devices
- **British English**: Consistent language throughout
- **Professional UX**: No browser alerts, custom modals
- **Visual Hierarchy**: Clear information architecture
- **Accessibility**: WCAG compliance for all users

### **User Dashboard**
- **Game Selection**: Grid layout with thumbnails
- **Progress Tracking**: Visual progress indicators
- **Profile Management**: Account settings, subscription status
- **Music Settings**: Personal track management

### **Admin Interface**
- **Role-Based Navigation**: Access control per admin type
- **Real-Time Updates**: Live data synchronization
- **Professional Modals**: Custom confirmation dialogs
- **Comprehensive Search**: Multi-field question search
- **Bulk Operations**: Efficient content management

---

## 🔒 **SECURITY & COMPLIANCE**

### **Data Protection**
- **GDPR Compliance**: Cookie consent, data export/deletion
- **Rate Limiting**: Prevent abuse and scraping
- **Input Validation**: SQL injection prevention
- **File Upload Security**: MIME type validation, size limits
- **Session Security**: Secure token management

### **Abuse Prevention**
- **Brute Force Protection**: Login attempt limiting
- **API Rate Limiting**: Prevent excessive requests
- **Content Validation**: Question import validation
- **User Verification**: Email confirmation system

---

## 📊 **MONITORING & ANALYTICS**

### **Performance Monitoring**
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Engagement and behavior tracking
- **System Health**: Database and API monitoring

### **Business Intelligence**
- **Category Performance**: Question difficulty analysis
- **User Engagement**: Session duration, return rates
- **Conversion Metrics**: Free to premium conversion
- **Geographic Analysis**: User distribution mapping

---

## 🚀 **DEPLOYMENT & INFRASTRUCTURE**

### **Railway Production Deployment**
- **PostgreSQL Database**: Managed database service
- **Environment Variables**: Secure configuration management
- **SSL Certificates**: HTTPS enforcement
- **Domain Configuration**: Custom domain setup
- **Backup Strategy**: Automated database backups

### **Development Environment**
- **Replit**: Development and testing platform
- **SQLite**: Local database for development
- **Hot Reload**: Real-time development updates
- **Version Control**: Git integration with backups

### **Scaling Considerations**
- **Target Load**: 500 concurrent users
- **Database Optimization**: Indexing and query optimization
- **CDN**: Content delivery for static assets
- **Caching Strategy**: Redis for session and data caching

---

## 🎵 **BACKGROUND MUSIC SYSTEM**

### **Admin Music Management**
- **Track Library**: Up to 10 background tracks (10MB each)
- **Rotation System**: Automatic track cycling during gameplay
- **Upload Interface**: Professional track management
- **Activation Control**: Enable/disable tracks in rotation

### **User Music Features**
- **Free Users**: 0 custom track upload
- **Premium Users**: 1 custom track uploads (5MB each)
- **Personal Preferences**: Choose admin vs. personal music
- **Volume Control**: 6-level volume system (0-5)
- **Smart Audio**: Maximum 50% volume to preserve sound effects

### **Audio Technical Specs**
- **Formats**: MP3 supported
- **Quality**: 128-320 kbps recommended
- **Looping**: Seamless background playback
- **Memory Management**: Efficient audio loading and cleanup

---

## 📱 **MOBILE OPTIMIZATION**

### **Responsive Design**
- **Touch-Friendly**: Large buttons and touch targets
- **Swipe Gestures**: Intuitive navigation
- **Vertical Layout**: Mobile-first question presentation
- **Fast Loading**: Optimized images and assets

### **Performance Optimization**
- **Lazy Loading**: Progressive content loading
- **Image Compression**: WebP format with fallbacks
- **Minification**: CSS/JS optimization
- **Caching**: Aggressive caching strategy

---

## 🧪 **TESTING & QUALITY ASSURANCE**

### **Automated Testing**
- **Unit Tests**: Game logic and randomization
- **Integration Tests**: Payment flow testing
- **API Testing**: Endpoint validation
- **Security Testing**: Vulnerability scanning

### **Manual Testing**
- **Cross-Browser**: Chrome, Safari, Firefox, Edge
- **Device Testing**: Mobile, tablet, desktop
- **User Journey**: Complete gameplay flows
- **Admin Functions**: Full admin panel testing

---

## 🔄 **CONTENT MANAGEMENT WORKFLOW**

### **Question Import Process**
1. **CSV/Excel Preparation**: Format validation
2. **Admin Upload**: Bulk import interface
3. **Data Validation**: Automatic error checking
4. **Category Assignment**: Game and card categorization
5. **Quality Review**: Admin approval workflow
6. **Publication**: Live question deployment

### **Game Creation Workflow**
1. **Game Setup**: Name, description, type selection
2. **Thumbnail Upload**: Image optimization and storage
3. **Category Creation**: Card setup for nested games
4. **Question Assignment**: Bulk question import
5. **Testing**: Preview and validation
6. **Publication**: Release to users

---

## 📈 **FUTURE ENHANCEMENTS**

### **Phase 2 Features**
- **Leaderboards**: Global and category-specific rankings
- **Social Features**: Friend challenges, shared scores
- **Achievement System**: Progress badges and rewards
- **Multiplayer Mode**: Real-time competitive gameplay

### **Advanced Analytics**
- **AI-Powered Insights**: Question difficulty optimization
- **Personalization**: Adaptive question selection
- **Predictive Analytics**: Churn prediction and retention
- **A/B Testing**: Feature and UI optimization

### **Platform Expansion**
- **Mobile Apps**: Native iOS/Android applications
- **Offline Mode**: Download and play without internet
- **Voice Interface**: Audio-based question interaction
- **AR/VR Integration**: Immersive gameplay experiences

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Core Platform**
- [x] User authentication and session management
- [x] Game selection and navigation interface  
- [x] Question presentation and answer validation
- [x] Admin panel with role-based access
- [x] Database schema and API endpoints
- [x] File upload and media management

### **Advanced Features**
- [x] Background music system with user uploads
- [x] Professional confirmation modals
- [x] Comprehensive search functionality
- [x] CSV import system with validation
- [x] Multi-device session enforcement
- [x] Progressive web app optimization

### **Production Requirements**
- [x] Railway deployment configuration
- [x] PostgreSQL database setup
- [x] SSL certificate and domain configuration
- [x] Backup and monitoring systems
- [x] Error tracking and logging
- [x] Performance optimization

---

## 🎯 **SUCCESS METRICS**

### **User Engagement**
- **Daily Active Users**: Target 100+ DAU
- **Session Duration**: Average 15+ minutes per session
- **Return Rate**: 60%+ weekly return rate
- **Completion Rate**: 80%+ question completion rate

### **Business Metrics**
- **Conversion Rate**: 5%+ free to premium conversion
- **Customer Lifetime Value**: £50+ average LTV
- **Churn Rate**: <10% monthly churn
- **Revenue Growth**: 20%+ monthly growth

### **Technical Performance**
- **Page Load Time**: <3 seconds on mobile
- **API Response Time**: <200ms average
- **Uptime**: 99.9% availability
- **Error Rate**: <0.1% error occurrence

---

## 📞 **SUPPORT & MAINTENANCE**

### **Admin Training**
- **Content Management**: Question import and game creation
- **User Support**: Account management and troubleshooting  
- **Analytics Review**: Performance monitoring and reporting
- **System Updates**: Feature releases and maintenance

### **Ongoing Development**
- **Feature Requests**: User feedback integration
- **Bug Fixes**: Issue tracking and resolution
- **Performance Optimization**: Continuous improvement
- **Security Updates**: Regular security patches

---

**This comprehensive brief represents a fully-featured trivia game platform with enterprise-level admin management, designed for scalable deployment on Railway with sophisticated user engagement and monetization strategies.**
