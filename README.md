# Targeted Games Platform

A modern gaming platform built with Next.js and Strapi.

## Project Structure

```
├── apps/
│   ├── frontend/     # Next.js application
│   └── backend/      # Strapi application
├── tests/            # E2E tests with Playwright
├── docs/            # Project documentation
└── scripts/         # Utility scripts
```

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Docker (optional, for containerized development)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend (Next.js) on http://localhost:3000
   - Backend (Strapi) on http://localhost:1337

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run frontend` - Start only the frontend
- `npm run backend` - Start only the backend
- `npm run build` - Build both applications
- `npm run start` - Start both applications in production mode
- `npm run test` - Run frontend unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run clean` - Clean all build artifacts and dependencies

## Environment Variables

Create `.env` files in both frontend and backend directories:

### Frontend (.env.local)
```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

### Backend (.env)
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

## Documentation

- [Frontend Documentation](./docs/frontend.md)
- [Backend Documentation](./docs/backend.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## Testing

- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Test UI mode: `npm run test:e2e:ui`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 