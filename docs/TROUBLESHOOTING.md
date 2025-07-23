# Troubleshooting Game Creation Issues

This document provides steps to fix issues with game creation in the admin dashboard.

## Issue: 403 Forbidden Error When Creating Games

The main issue is a 403 Forbidden error when trying to create games through the admin dashboard. This is typically caused by one or more of the following:

1. Invalid or missing Strapi Admin Token
2. Incorrect permissions for game and category creation
3. Field name mismatches between frontend and backend

## Solution Steps

### 1. Generate a Valid Strapi Admin Token

The STRAPI_ADMIN_TOKEN environment variable is used to authenticate API requests from the Next.js frontend to the Strapi backend. If this token is invalid or missing, you'll get 403 Forbidden errors.

```bash
# Install dependencies if not already installed
npm install axios dotenv

# Run the token generation script
node scripts/generate-strapi-token.js your-strapi-admin@email.com your-password
```

This script will:

- Log in to your Strapi admin account
- Create a new API token with full access
- Update your .env.local file with the new token

### 2. Fix Permissions in Strapi

The game and category controllers need proper permissions for the authenticated and Frontend_Admin roles.

```bash
# Run the permissions fix script
node scripts/fix-permissions.js your-strapi-admin@email.com your-password
```

This script will:

- Log in to your Strapi admin account
- Enable all permissions for game and category controllers
- Update both the Authenticated and Frontend_Admin roles

### 3. Check Environment Variables

Verify that all required environment variables are properly set:

```bash
# Run the environment check script
node scripts/check-env.js
```

### 4. Field Name Fixes

We've already fixed the field name mismatch between the frontend and backend:

- Changed `thumbnail` to `imageUrl` in the frontend API
- Updated the game controller to handle the correct field names

### 5. Restart Servers

After making these changes:

1. Restart your Strapi server:

```bash
cd backend
npm run develop
```

2. Restart your Next.js server:

```bash
npm run dev
```

## Manual Verification Steps

If you still encounter issues, you can manually verify the setup:

### Check Strapi Permissions

1. Log in to Strapi admin (http://localhost:1337/admin)
2. Go to Settings > Users & Permissions Plugin > Roles
3. Edit the "Authenticated" role
4. Ensure that all permissions for "Game" and "Category" are enabled
5. Save the changes

### Check API Token

1. Log in to Strapi admin
2. Go to Settings > API Tokens
3. Verify that you have a valid token with full access
4. If not, create a new one and update your .env.local file

### Test Direct API Access

You can test direct API access using curl:

```bash
# Replace YOUR_TOKEN with your actual token
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"data":{"name":"Test Game","description":"Test description","type":"STRAIGHT","status":"DRAFT","isActive":true}}' http://localhost:1337/api/games
```

## Common Errors and Solutions

### "Cannot read properties of undefined (reading 'find')"

This error in the Strapi logs indicates an issue with the database connection or model definition. Make sure:

1. Your database is running and accessible
2. The model schema is correctly defined
3. The Strapi server has been restarted after any schema changes

### "Method Not Allowed"

This error suggests that the route exists but the HTTP method (POST, GET, etc.) is not allowed. Check:

1. The route configuration in Strapi
2. The permissions for the specific method
3. That you're using the correct HTTP method in your requests

### "Authentication error - STRAPI_ADMIN_TOKEN might be invalid"

This means the token being used is not valid. Solutions:

1. Generate a new token using the script provided
2. Make sure the token has full access permissions
3. Verify the token is correctly set in your .env.local file
