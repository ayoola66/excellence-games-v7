# Question Management System

A comprehensive system for managing questions for straight and nested games, built with Next.js 13+, TypeScript, and Tailwind CSS.

## Features

### Completed Features

#### Authentication

- [x] Admin authentication with NextAuth
- [x] Protected routes and API endpoints
- [x] Session management

#### Question Management

- [x] Support for two game types:
  - Straight Games: Single bucket of questions for cards 1-5 (card 6 is special)
  - Nested Games: 5 categories mapped to cards 1-5, each with its own question pool
- [x] CRUD operations for questions
- [x] Bulk upload via CSV (Straight games) and XLSX (Nested games)
- [x] Question search and filtering
- [x] Pagination support
- [x] Active/Inactive question status

#### Game Management

- [x] Game creation and configuration
- [x] Game type selection (Straight/Nested)
- [x] Game status management

#### Category Management (for Nested Games)

- [x] Category CRUD operations
- [x] Category-Card mapping
- [x] Category-specific question pools

#### UI/UX

- [x] Responsive grid layout (1-4 columns based on screen size)
- [x] Modern UI components using shadcn/ui
- [x] Toast notifications for user feedback
- [x] Loading states and error handling
- [x] Confirmation dialogs for destructive actions

### Planned Features

#### User Management

- [ ] Role-based access control
- [ ] User profile management
- [ ] Activity logging

#### Game Features

- [ ] Game session management
- [ ] Real-time game state updates
- [ ] Score tracking
- [ ] Game statistics and analytics

#### Content Management

- [ ] Rich text editor for questions
- [ ] Image support for questions
- [ ] Question versioning
- [ ] Question difficulty levels
- [ ] Question tags and categories

#### API and Integration

- [ ] Public API for game integration
- [ ] Webhook support for game events
- [ ] Third-party authentication providers
- [ ] Export functionality for game data

#### Advanced Features

- [ ] AI-powered question generation
- [ ] Question quality analysis
- [ ] Performance analytics
- [ ] Custom game rule configuration

## Authentication & Middleware

### Route Protection
- Admin routes (`/admin/*`) are protected by middleware
- Normal users are redirected to an "Access Denied" page when attempting to access admin routes
- Public routes and normal sign-in remain accessible at root level (`/`)

### Admin Authentication
- Token-based authentication system for admin access
- Configurable token lifetimes and refresh tokens
- Secure token generation and management
- See [Admin Authentication](./docs/admin-auth.md) for setup and usage details

### British English Policy
- All user-facing text throughout the application uses British English spelling
- This includes all UI elements, error messages, and documentation
- Contributors should maintain consistency with British English in all new features and updates

## Technical Stack

- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS
- **Backend**: Strapi v4 (Headless CMS)
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js (for frontend), Strapi JWT (for backend)
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form
- **State Management**: React Context + Hooks
- **File Handling**: CSV (for Straight games) and XLSX (for Nested games) parsing (handled by custom logic)

## Getting Started

This project is structured with a separate frontend (Next.js) and backend (Strapi).

### Backend (Strapi)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend` directory. It will be configured for your database (e.g., PostgreSQL).
   ```
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=...
   API_TOKEN_SALT=...
   ADMIN_JWT_SECRET=...
   JWT_SECRET=...
   DATABASE_URL="your-database-url"

   # Admin Authentication
   ADMIN_TOKEN_LIFETIME=7d
   ADMIN_REFRESH_TOKEN_LIFETIME=30d
   ADMIN_INITIAL_TOKEN=... # Generate with: openssl rand -base64 32
   ```
4. Start the Strapi server in development mode:
   ```bash
   npm run develop
   ```
5. Access the Strapi admin panel at `http://localhost:1337/admin` and create your first admin user.

### Frontend (Next.js)

1. In a new terminal, navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_STRAPI_API_URL="http://localhost:1337"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser to see the admin dashboard.

## Project Structure

```
├── app/                  # Next.js 13+ app directory
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   └── ui/             # Reusable UI components
├── lib/                 # Utility functions and shared code
├── prisma/             # Database schema and migrations
└── public/             # Static assets
```

## API Routes

### Questions

- `GET /api/admin/questions` - List questions with pagination
- `POST /api/admin/questions` - Create a new question
- `PUT /api/admin/questions/:id` - Update a question
- `DELETE /api/admin/questions/:id` - Delete a question

### Games

- `GET /api/admin/games` - List all games
- `POST /api/admin/games` - Create a new game
- `PUT /api/admin/games/:id` - Update a game
- `DELETE /api/admin/games/:id` - Delete a game

### Categories

- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create a new category
- `PUT /api/admin/categories/:id` - Update a category
- `DELETE /api/admin/categories/:id` - Delete a category

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## **Live Testing Feedback Plan**

### 1. **Step-by-Step Test Announcements**

- I’ll announce each test as it begins (e.g., “Testing Strapi backend startup…”).
- I’ll immediately report the result (✅ Success, ⚠️ Warning, ❌ Error) for each test.

### 2. **Detailed Results**

- For each major area (backend, frontend, CRUD, login, dashboard, etc.), I’ll provide:
  - What was tested
  - The outcome (pass/fail)
  - Any issues or errors found (with details)

### 3. **Summary Table**

- I’ll maintain a running summary table in the chat, updating it as each test is completed.

---

## **Example Live Feedback**

```
🟢 Testing Strapi backend startup…
✅ Strapi backend started successfully.

🟢 Testing User CRUD in Strapi admin…
✅ User CRUD operations working as expected.

🟢 Testing Superadmin login on frontend…
❌ Superadmin login failed: Incorrect password error.
```

---

**I’ll begin this live feedback now, so you can follow along in real time.  
If you want extra detail on any test, just ask!**

---

### **Starting Live Testing Now…**
