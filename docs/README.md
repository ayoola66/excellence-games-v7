# Excellence Games Platform

## Overview

Excellence Games is a web-based competitive gaming platform that shapes character through engaging board games. Our platform features:

- **UK Edition/Black Edition**: Our flagship board game focusing on prestige, intellect, and social growth
- **Targeted**: A fast-paced, cutthroat game designed for high-energy fun and social virality

## Brand Identity

- **Purpose**: Parent company and creator of competitive, character-building board games
- **Tagline**: _Home of competitive games that shape character._
- **Voice**: Leadership • Bold • Strategic • Growth-oriented
- **Core Colors**:
  - Legacy Maroon (#83341A)
  - Gold Focus (#DA9827)
  - Accent Yellow (#FFCF41)
  - Cobalt Blue (#004aad)

## Platform Features

### Game Types

- **Straight Trivia**: Sequential questions from a chosen category without repeats until exhaustion.
- **Nested Card Games**: Dice-rolled cards (1–6) with themed question pools; card 6 is a special bonus.

### User Management

- **Free Users**: Access to free games; no music upload capability.
- **Premium Users**: Full game access, one 5 MB custom music upload, and ad-free experience.
- JWT-based authentication with single-device session enforcement.

### Administrator Roles

- **Super Admin (SA)**: Full platform control and financial data access.
- **Dev Admin (DEV)**: Development and content management, limited administrator management.
- **Shop Admin (SH)**: E-commerce and product catalogue management.
- **Content Admin (CT)**: Question and category CRUD operations.
- **Customer Admin (CS)**: User support and analytics.

### Background Music System

- Admin can upload up to 10 MP3 tracks (10 MB each).
- Premium users can upload one 5 MB custom track.
- Volume control levels (0–5) and automatic track rotation.

### Monetisation & Payment

- Annual subscriptions via Stripe.
- Free tier with adverts; Premium tier ad-free.
- Coupon and pricing management with usage caps and expiration.

## Technical Architecture

### Frontend

- Next.js 14+ with App Router and Tailwind CSS for responsive design.
- React Context API and custom hooks for state management.
- TypeScript for robust typing and developer experience.

### Backend

- Strapi 4.25 CMS with custom controllers, policies, and routes.
- PostgreSQL for production; SQLite for local development.
- RESTful API endpoints with input validation and error handling.

## Project Structure

```bash
targeted/
├── apps/
│   ├── frontend/   # Next.js application
│   └── backend/    # Strapi CMS application
├── docs/           # Documentation and implementation guides
├── scripts/        # Utility and setup scripts
├── tests/          # Unit and end-to-end tests
└── README.md
```

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/ayoola66/targeted_v2.git
   cd targeted
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start both applications:

   ```bash
   npm run dev
   ```

   - Frontend User: http://localhost:3000/user/login
   - Frontend Admin: http://localhost:3000/admin/login
   - Backend: http://localhost:1337

## Available Scripts

- `npm run dev` – Start frontend and backend in development mode.
- `npm run frontend` – Start only the frontend.
- `npm run backend` – Start only the backend.
- `npm run build` – Build both applications for production.
- `npm run start` – Serve both applications in production mode.
- `npm run test` – Run unit tests.
- `npm run test:e2e` – Run end-to-end tests.
- `npm run clean` – Remove build artefacts and dependencies.

## Environment Variables

### Backend (`apps/backend/.env`)

```bash
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
DATABASE_HOST=your-postgres-host
DATABASE_NAME=targeted_games
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-db-password
```

### Frontend (`apps/frontend/.env.local`)

```bash
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Documentation

See the `docs/` directory for:

- **Implementation Plans** (`docs/implementation`)
- **Setup Guides** (`docs/setup`)
- **Testing Strategies** (`docs/testing`)

## Contributing

1. Create a branch for your feature or fix.
2. Commit your changes with descriptive messages.
3. Run tests to ensure nothing is broken.
4. Open a pull request for review.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
