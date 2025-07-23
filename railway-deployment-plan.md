# Railway Deployment Strategy for Targeted v2

## Overview

This document outlines the comprehensive strategy for deploying the Targeted v2 application to Railway, ensuring reliable admin functionality without direct database access.

## Current Architecture

- **Frontend**: Next.js (React)
- **Backend**: Strapi CMS v4.15.0
- **Database**: PostgreSQL
- **Authentication**: Token-based with cookies
- **File Storage**: Local filesystem (needs Railway adaptation)

## Railway-Specific Challenges & Solutions

### 1. Ephemeral Filesystem Issue

**Problem**: Railway's filesystem is ephemeral - files uploaded to Strapi will be lost on container restarts.

**Solutions**:

- **Option A**: Use Railway's built-in PostgreSQL with persistent storage
- **Option B**: Integrate with external file storage (AWS S3, Cloudinary)
- **Option C**: Use Railway's volume mounts for persistent file storage

### 2. Database Migration Strategy

**Problem**: Need reliable database setup and migrations for Railway deployment.

**Solution**:

- Implement automated database migrations
- Use Railway's PostgreSQL plugin
- Create backup/restore procedures

### 3. Environment Configuration

**Problem**: Railway requires specific environment variable handling.

**Solution**:

- Use Railway's environment variable system
- Implement proper configuration management
- Set up staging/production environments

## Implementation Plan

### Phase 1: Railway Configuration (Week 1)

#### 1.1 Railway Project Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
railway init

# Add PostgreSQL service
railway add postgresql
```

#### 1.2 Environment Variables

Create `railway.toml` configuration:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/api/admin/health"
healthcheckTimeout = 300

[env]
NODE_ENV = "production"
NEXT_PUBLIC_APP_URL = "https://your-app.railway.app"
NEXT_PUBLIC_STRAPI_API_URL = "https://your-app.railway.app"
```

#### 1.3 Database Configuration

Update Strapi database configuration for Railway:

```javascript
// backend/config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST"),
      port: env("DATABASE_PORT"),
      database: env("DATABASE_NAME"),
      user: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
      ssl: env.bool("DATABASE_SSL", false),
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
  },
});
```

### Phase 2: File Storage Solution (Week 1)

#### 2.1 Cloudinary Integration

Install Cloudinary plugin for Strapi:

```bash
cd backend
npm install @strapi/provider-upload-cloudinary
```

Configure Cloudinary in Strapi:

```javascript
// backend/config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "@strapi/provider-upload-cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
    },
  },
});
```

#### 2.2 Update Admin API for Cloudinary

Modify game creation/update APIs to handle Cloudinary URLs:

```typescript
// Enhanced file upload handling
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
};
```

### Phase 3: Database Migration Strategy (Week 2)

#### 3.1 Automated Migrations

Create migration scripts:

```typescript
// scripts/railway-migrations.ts
import { Knex } from "knex";
import { Umzug } from "umzug";

const config: Knex.Config = {
  client: "postgresql",
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === "true",
  },
  migrations: {
    directory: "./database/migrations",
    tableName: "knex_migrations",
  },
};

const umzug = new Umzug({
  migrations: { glob: "database/migrations/*.ts" },
  context: { knex: require("knex")(config) },
  storage: "knex",
  storageOptions: { knex: require("knex")(config) },
});

export default umzug;
```

#### 3.2 Railway Deployment Script

Create deployment script:

```bash
#!/bin/bash
# scripts/deploy-railway.sh

echo "🚀 Starting Railway deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
```

### Phase 4: Enhanced Admin Interface (Week 2)

#### 4.1 Improved Game Management

Create comprehensive game management interface:

```typescript
// Enhanced game form with validation
interface GameFormData {
  title: string;
  description: string;
  type: "QUIZ" | "PUZZLE" | "ADVENTURE";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnail?: File;
  isActive: boolean;
  isPremium: boolean;
  categoryId?: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  estimatedDuration: number; // in minutes
  maxPlayers: number;
  tags: string[];
}
```

#### 4.2 Real-time Status Monitoring

Implement health monitoring:

```typescript
// lib/admin-monitoring.ts
export class AdminMonitoring {
  static async checkSystemHealth() {
    const checks = {
      database: await this.checkDatabase(),
      fileStorage: await this.checkFileStorage(),
      api: await this.checkAPI(),
    };

    return {
      status: Object.values(checks).every((c) => c.status === "healthy")
        ? "healthy"
        : "unhealthy",
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Phase 5: Production Deployment (Week 3)

#### 5.1 Railway Production Setup

```bash
# Set up production environment
railway environment production

# Configure production variables
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_APP_URL=https://your-app.railway.app
railway variables set CLOUDINARY_NAME=your-cloudinary-name
railway variables set CLOUDINARY_KEY=your-cloudinary-key
railway variables set CLOUDINARY_SECRET=your-cloudinary-secret
```

#### 5.2 Monitoring and Logging

Implement comprehensive logging:

```typescript
// lib/admin-logging.ts
export class AdminLogger {
  static logAdminAction(action: string, userId: number, details: any) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        action,
        userId,
        details,
      })
    );
  }

  static logError(error: Error, context: string) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        error: error.message,
        stack: error.stack,
        context,
      })
    );
  }
}
```

## Security Considerations

### 1. Admin Authentication

- Implement rate limiting for login attempts
- Use secure session management
- Implement proper token refresh mechanisms

### 2. File Upload Security

- Validate file types and sizes
- Implement virus scanning for uploads
- Use secure URLs for file access

### 3. Database Security

- Use Railway's managed PostgreSQL
- Implement proper connection pooling
- Regular security updates

## Monitoring and Maintenance

### 1. Health Checks

- Implement comprehensive health check endpoints
- Monitor database connectivity
- Track file storage availability

### 2. Backup Strategy

- Automated database backups
- File storage redundancy
- Disaster recovery procedures

### 3. Performance Monitoring

- Track API response times
- Monitor memory usage
- Database query optimization

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] File storage configured
- [ ] Health checks implemented

### Deployment

- [ ] Railway project created
- [ ] PostgreSQL service added
- [ ] Environment variables set
- [ ] Application deployed
- [ ] Database migrations run
- [ ] Health checks passing

### Post-Deployment

- [ ] Admin login tested
- [ ] Game creation tested
- [ ] File uploads working
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

## Expected Outcomes

### 1. Reliable Admin Interface

- 99.9% uptime for admin functionality
- Secure authentication and authorization
- Comprehensive game management capabilities

### 2. Railway Optimisation

- Efficient resource usage
- Fast deployment times
- Reliable database operations

### 3. Client Handover Ready

- Complete admin documentation
- Training materials for clients
- Support procedures established

## Timeline

- **Week 1**: Railway configuration and file storage setup
- **Week 2**: Database migrations and enhanced admin interface
- **Week 3**: Production deployment and monitoring setup
- **Week 4**: Testing, documentation, and client handover

This strategy ensures a robust, Railway-optimised admin interface that eliminates the need for direct database access while providing comprehensive game management capabilities.
