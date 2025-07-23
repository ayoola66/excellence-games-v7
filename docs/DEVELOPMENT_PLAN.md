# Excellence Games Platform - Development Plan

### **1. High-Level Strategy & Architecture**

Our architecture will consist of two main pillars:

1.  **Backend (Strapi):** A robust, headless CMS responsible for all data management, content modelling, user authentication, and business logic. It will expose a RESTful API for the frontend.
2.  **Frontend (Next.js):** A modern, server-rendered React application that consumes the Strapi API. It will handle all user-facing interfaces, the custom admin dashboard, and interactions with third-party services like Stripe.

**Key Correction:** The current NextAuth.js setup in `lib/auth.ts` attempts to query the database directly and compare passwords. This is incorrect for a Strapi backend. We will need to refactor it to use Strapi's `/api/auth/local` endpoint for JWT-based authentication, which is more secure and standard.

### **2. Phase 1: Backend Foundation - Strapi Content Modelling & RBAC**

**Objective:** To build the complete data schema in Strapi and configure all necessary roles and permissions. This is the bedrock of our application.

- **Task 1: Content-Type Scaffolding:**

  - Based on your image and `README` files, I will create the following Collection Types in Strapi:
    - `User Profile`: To extend the default `User` with app-specific data. It will have a one-to-one relationship with a `User` from the Users & Permissions plugin. Fields will include `tier` (enum: 'Free', 'Premium'), `musicUpload` (media), and `gameScores` (relation).
    - `Game`: Fields for `title`, `description`, `type` (enum: 'Straight', 'Nested'), and relationships to `Category` and `Question`.
    - `Category`: For nested games. Fields for `name` and relationship to `Question`.
    - `Question`: Fields for `text`, `options` (JSON), `correctOption` (integer), `game` (relation), and `category` (relation).
    - `Music Upload`: To store tracks uploaded by users and admins. Fields for `title`, `file` (media), `uploader` (relation to User).
    - `Product`: For Stripe subscriptions. Fields for `name`, `description`, `price`, `stripePriceId`.
    - `Order`: To track subscriptions. Fields for `user` (relation), `product` (relation), `totalAmount`, `status`.
    - `Coupon`: Fields for `code`, `discountPercentage`, `usageLimit`, `expirationDate`.
    - `User Activity`: To log significant user actions for analytics.

- **Task 2: Configure Roles & Permissions:**

  - **Frontend User Roles:** Define public/authenticated roles for the API.
    - **Public:** Can view public content (e.g., game descriptions).
    - **Authenticated (Free/Premium):** Can access core game APIs. We will use policies to restrict features like music uploads to Premium users only.
  - **Backend Admin Roles (RBAC):** Configure Strapi's built-in RBAC for your administrative team.
    - **Super Admin:** Full access.
    - **Dev Admin:** Full content access, limited user management.
    - **Content Admin:** CRUD access only for `Game`, `Category`, and `Question`.
    - **Shop Admin:** CRUD access for `Product`, `Order`, and `Coupon`.
    - **Customer Admin:** Read-only access to `User`, `UserProfile`, and `User Activity`.

- **Task 3: Seeding Initial Data:**
  - I will use the credentials you provided (`superadmin@excellencegames.com`, `devadmin@excellencegames.com`, etc.) to create a startup script that seeds these initial admin users into Strapi. This ensures your administrative team can log in from day one.

### **3. Phase 2: Frontend Foundation - Authentication & Layouts**

**Objective:** To establish the Next.js application's core structure, connect it to the Strapi backend for authentication, and create the main UI layouts.

- **Task 1: Next.js Project Setup:**

  - Standardise the Next.js project structure (`app`, `components`, `lib`, `styles`).
  - Establish a global state management solution using React Context for user sessions and application-wide settings.
  - Implement brand colors:
    - Legacy Maroon (#83341A)
    - Gold Focus (#DA9827)
    - Accent Yellow (#FFCF41)
    - Cobalt Blue (#004aad)

- **Task 2: Authentication Flow (The Right Way):**

  - Refactor `lib/auth.ts` to use `CredentialsProvider` with Strapi's `/api/auth/local` endpoint. This will involve sending the user's email and password to Strapi and receiving a JWT in return.
  - Store the JWT and user data securely in the NextAuth.js session.
  - Build the sign-in, sign-up, and forgot-password pages.
  - Implement protected routes using Next.js Middleware, redirecting unauthenticated users from admin or user-specific pages.

- **Task 3: UI Layouts:**
  - Create three distinct root layouts:
    1.  **Public Layout:** For marketing pages and the login screen, featuring the Excellence Games branding and tagline "Home of competitive games that shape character."
    2.  **User Dashboard Layout:** For authenticated users, including navigation for games, profile, etc.
    3.  **Admin Dashboard Layout:** A separate, secure layout for platform administrators.

### **4. Phase 3: Core Feature Development - Gameplay & User Experience**

**Objective:** To build the heart of the platform—the games and the user-facing dashboard.

- **Task 1: Game Interfaces:**

  - Develop the React components for both "UK Edition/Black Edition" and "Targeted" games.
  - Fetch all game data from the Strapi API.
  - Implement real-time game state logic on the frontend (e.g., managing scores, timers, and current questions).

- **Task 2: User Profile & Music Management:**
  - Create the user dashboard where users can view their stats and manage their profile.
  - For Premium users, build the music upload form. This will post the file to a secure Strapi endpoint and link it to their profile.
  - Develop the in-game music player to stream tracks from Strapi.

### **5. Phase 4: Admin Dashboard & Monetisation**

**Objective:** To empower your team with a custom admin dashboard and integrate the subscription model.

- **Task 1: Custom Admin Dashboard:**

  - Build a custom admin panel within the Next.js app (distinct from the Strapi admin UI).
  - This dashboard will feature:
    - **Analytics:** Visual charts for user registrations, revenue, and game engagement.
    - **User Management:** A table to view, filter, and manage users.
    - **Content Management:** Simplified interfaces for admins to manage games, questions, and categories without needing to go into the more complex Strapi admin panel.
  - The dashboard's UI and functionality will be dynamically rendered based on the logged-in admin's role.

- **Task 2: Stripe Integration:**
  - Integrate Stripe for handling annual subscriptions.
  - Create a dedicated "Upgrade" page where users can select the Premium plan.
  - Use Stripe Checkout for a secure and seamless payment experience.
  - Implement a Strapi webhook endpoint to listen for successful payments from Stripe, which will automatically upgrade the user's `tier` in their `User Profile` to 'Premium'.
