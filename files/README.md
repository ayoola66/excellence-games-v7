# Elite Games Trivia Platform

Monorepo for the Elite Games Trivia Platform.

## Structure

- `apps/frontend` - Next.js 14+ (User and Admin portals)
- `apps/backend`  - Strapi CMS (User, Admin, Game, Question management)
- `packages/ui`   - Shared UI components (optional)
- `packages/utils`- Shared utilities (optional)
- `infra/`        - Deployment configs

## Getting Started

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### Backend

```bash
cd apps/backend
npm install
npm run develop
```

See separate READMEs in each app for local setup details.