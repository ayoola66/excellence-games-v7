# Error Solutions & Troubleshooting Guide

This document contains solutions to common errors and issues encountered in the Targeted V2 project. Each entry includes the error description, root cause, and step-by-step solution.

## Table of Contents

1. [Authentication & Permission Errors](#authentication--permission-errors)
2. [API Route Errors](#api-route-errors)
3. [Form & UI Issues](#form--ui-issues)
4. [Database & Strapi Configuration](#database--strapi-configuration)
5. [Frontend Build & Import Issues](#frontend-build--import-issues)

---

## Authentication & Permission Errors

### Error: `POST http://localhost:3000/api/admin/games 403 (Forbidden)`

**Description**: Game creation fails with 403 Forbidden error when submitting the form.

**Root Cause**: The Frontend_Admin role in Strapi doesn't have permissions to create games or upload files.

**Solution**:

1. Create a Strapi console script to enable permissions:

   ```javascript
   (async () => {
     // Find Frontend_Admin role
     const role = await strapi.query("plugin::users-permissions.role").findOne({
       where: { type: "Frontend_Admin" },
     });

     // Get all permissions for the role
     const permissions = await strapi
       .query("plugin::users-permissions.permission")
       .findMany({
         where: { role: role.id },
       });

     // Enable all API permissions
     const apiPermissions = permissions.filter((p) =>
       p.type.startsWith("api::")
     );
     for (const permission of apiPermissions) {
       await strapi.query("plugin::users-permissions.permission").update({
         where: { id: permission.id },
         data: { enabled: true },
       });
     }

     // Enable upload permissions
     const uploadPermissions = permissions.filter(
       (p) => p.type === "plugin::upload.content-api"
     );
     for (const permission of uploadPermissions) {
       await strapi.query("plugin::users-permissions.permission").update({
         where: { id: permission.id },
         data: { enabled: true },
       });
     }
   })();
   ```

2. Run the script: `cd backend && npm run strapi -- console < script.js`
3. Restart both Strapi and Next.js servers

**Prevention**: Ensure the Frontend_Admin role has proper permissions during initial setup using bootstrap scripts.

---

### Error: Invalid CSRF Token / CSRF Validation Failures

**Description**: Form submissions fail due to CSRF token validation errors.

**Root Cause**: The custom admin authentication system doesn't use NextAuth CSRF tokens.

**Solution**:

1. Remove CSRF token validation from API routes
2. Remove CSRF token addition from forms
3. Rely on Bearer token authentication instead

**Files Modified**:

- `app/api/admin/games/route.ts` - Remove CSRF validation
- `components/admin/games/game-form.tsx` - Remove CSRF token append

---

## API Route Errors

### Error: `GET http://localhost:1337/api/admin/dashboard/stats 404 (Not Found)`

**Description**: Dashboard stats endpoint returns 404 when loading admin dashboard.

**Root Cause**: Dashboard stats endpoint is served by Next.js app, not Strapi directly.

**Solution**:
Change the baseURL in `lib/admin-api-client.ts`:

```typescript
// From
baseURL: STRAPI_URL;

// To
baseURL: APP_URL; // for dashboard stats only
```

**Files Modified**: `lib/admin-api-client.ts`

---

### Error: Field Name Mismatch in Strapi API

**Description**: Game creation fails because Strapi expects different field names than what the frontend sends.

**Root Cause**: Frontend sends `title` but Strapi expects `name` field for games.

**Solution**:
In `app/api/admin/games/route.ts`, map the fields correctly:

```typescript
const gameData = {
  data: {
    name: title, // Map frontend 'title' to Strapi 'name'
    description,
    type,
    status,
    isActive: status === "PUBLISHED",
    isPremium: false,
    ...(imageId && { imageUrl: imageId }),
  },
};
```

**Files Modified**: `app/api/admin/games/route.ts`

---

## Form & UI Issues

### Error: Missing Thumbnail Upload Field

**Description**: Game creation form lacks thumbnail upload functionality.

**Root Cause**: Form wasn't designed to handle file uploads initially.

**Solution**:

1. Add file input to form with preview:

   ```typescript
   <div className="space-y-2">
     <Label htmlFor="thumbnail">Game Thumbnail</Label>
     <Input
       id="thumbnail"
       type="file"
       accept="image/*"
       onChange={handleImageChange}
     />
     {thumbnailPreview && (
       <div className="mt-2">
         <img
           src={thumbnailPreview}
           alt="Thumbnail preview"
           className="h-32 w-32 object-cover rounded-md"
         />
       </div>
     )}
   </div>
   ```

2. Add thumbnail to form submission:
   ```typescript
   if (thumbnail) {
     formData.append("thumbnail", thumbnail);
   }
   ```

**Files Modified**: `components/admin/games/game-form.tsx`

---

### Error: Hard-coded Content in Forms

**Description**: Form contains hard-coded values instead of being flexible for different game types.

**Root Cause**: Initial implementation was too specific rather than generic.

**Solution**:

1. Make form fields dynamic based on game type
2. Show category fields only for NESTED games:
   ```typescript
   {values.type === "NESTED" && (
     <div className="space-y-4">
       <Label>Categories (5 required)</Label>
       {[...Array(5)].map((_, index) => (
         <Input
           key={index}
           placeholder={`Category ${index + 1} name`}
           value={values.categories?.[index] || ""}
           onChange={(e) => {
             const newCategories = [...(values.categories || [])];
             newCategories[index] = e.target.value;
             setValue("categories", newCategories);
           }}
         />
       ))}
     </div>
   )}
   ```

**Files Modified**: `components/admin/games/game-form.tsx`

---

## Database & Strapi Configuration

### Error: Frontend_Admin Role Missing Permissions

**Description**: Frontend admin users cannot perform CRUD operations on content types.

**Root Cause**: Role created without proper permissions enabled.

**Solution**:
Use the bootstrap script or console command to create role with permissions:

```typescript
// In backend/src/bootstrap.ts
const role = await strapi.db.query("plugin::users-permissions.role").create({
  data: {
    name: "Frontend Admin",
    description: "Frontend administrator role with platform access",
    type: "Frontend_Admin",
  },
});

// Enable permissions for all API content types
// See full implementation in bootstrap.ts
```

**Files Modified**: `backend/src/bootstrap.ts`

---

### Error: Invalid Strapi API Token

**Description**: Direct API calls to Strapi fail with 403 when using API tokens.

**Root Cause**: API tokens have different permission structure than user tokens.

**Solution**:
Use Frontend_Admin user authentication instead of API tokens:

```typescript
// Use user token from login
Authorization: `Bearer ${adminToken}`;

// Instead of API token
Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`;
```

**Files Modified**: `app/api/admin/games/route.ts`

---

## Frontend Build & Import Issues

### Error: `TypeError: games.map is not a function`

**Date**: July 21, 2025  
**Description**: Runtime error when loading `/admin/games` page, indicating that the `games` variable is not an array when the component tries to map over it.

**Root Cause**:

1. API response structure mismatch - Strapi returns nested data structure `{ data: [...], meta: {...} }`
2. Component expected `response.data` to be an array directly
3. Missing field mapping between Strapi's `name` field and frontend's `title` field

**Solution**:

1. **Fix GameList component** to handle different response structures:

   ```typescript
   // Handle different possible response structures
   let gamesArray: Game[] = [];

   if (response.data) {
     if (Array.isArray(response.data)) {
       gamesArray = response.data;
     } else if (response.data.data && Array.isArray(response.data.data)) {
       gamesArray = response.data.data;
     }
   } else if (Array.isArray(response)) {
     gamesArray = response;
   }

   // Add safety check
   const safeGames = Array.isArray(games) ? games : [];
   ```

2. **Fix API route** to transform Strapi response:
   ```typescript
   // Transform Strapi response to match frontend Game interface
   if (data.data && Array.isArray(data.data)) {
     const transformedGames = data.data.map((game: any) => ({
       ...game,
       title: game.name, // Map Strapi 'name' to frontend 'title'
       thumbnail: game.imageUrl ? `${STRAPI_URL}${game.imageUrl}` : undefined,
     }));

     return NextResponse.json({
       ...data,
       data: transformedGames,
     });
   }
   ```

**Files Modified**:

- `app/admin/games/components/GameList.tsx`
- `app/api/admin/games/route.ts`

**Prevention**:

- Always add type guards and safety checks for array operations
- Log API responses during development to understand data structure
- Ensure consistent field naming between backend and frontend

---

### Error: Webpack Module Import Errors

**Description**: Pages fail to load with webpack module import errors.

**Root Cause**: Incorrect import paths or circular dependencies.

**Solution**:

1. Check import paths are correct
2. Ensure proper error handling in API client
3. Add response interceptors for better error management:
   ```typescript
   adminApiClient.interceptors.response.use(
     (response) => response,
     async (error) => {
       if (error.response?.status === 401) {
         // Handle token refresh
         window.location.href = "/admin/login";
       }
       return Promise.reject(error);
     }
   );
   ```

**Files Modified**: `lib/admin-api-client.ts`

---

## Debugging Tools & Scripts

### Console Script for Permission Debugging

Create a temporary script to check role permissions:

```javascript
(async () => {
  const role = await strapi.query("plugin::users-permissions.role").findOne({
    where: { type: "Frontend_Admin" },
  });

  const permissions = await strapi
    .query("plugin::users-permissions.permission")
    .findMany({
      where: { role: role.id },
    });

  console.log(
    "Role permissions:",
    permissions.map((p) => ({
      type: p.type,
      controller: p.controller,
      action: p.action,
      enabled: p.enabled,
    }))
  );
})();
```

### API Testing Script

For testing API endpoints directly:

```javascript
const fetch = require("node-fetch");

async function testGameCreation() {
  // Login first
  const loginResponse = await fetch(
    "http://localhost:1337/api/admin/auth/local",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "superadmin@elitegames.com",
        password: "Passw0rd",
      }),
    }
  );

  const { token } = await loginResponse.json();

  // Test game creation
  const gameResponse = await fetch("http://localhost:1337/api/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        name: "Test Game",
        description: "Test Description",
        type: "STRAIGHT",
        status: "DRAFT",
      },
    }),
  });

  console.log("Game creation result:", await gameResponse.text());
}
```

---

## Prevention Checklist

### Before Deploying Changes:

1. **Authentication**:

   - [ ] Verify Frontend_Admin role has all required permissions
   - [ ] Test login flow with correct credentials
   - [ ] Ensure token refresh works properly

2. **API Routes**:

   - [ ] Verify all endpoints use correct field names
   - [ ] Test file upload functionality
   - [ ] Check error handling and logging

3. **Forms**:

   - [ ] Test both STRAIGHT and NESTED game creation
   - [ ] Verify file upload with preview works
   - [ ] Check form validation for all required fields

4. **Servers**:
   - [ ] Restart both Strapi and Next.js after permission changes
   - [ ] Verify both servers are running on correct ports
   - [ ] Check environment variables are properly set

---

## Quick Reference

### Login Credentials:

- **Frontend Admin**: `superadmin@elitegames.com` / `Passw0rd`
- **Frontend URL**: `http://localhost:3000/admin/login`
- **Strapi Admin**: `http://localhost:1337/admin` (separate from frontend admin)

### Server Commands:

```bash
# Start Strapi
cd backend && npm run develop

# Start Next.js
npm run dev

# Strapi Console
cd backend && npm run strapi -- console

# Permission Check
cd backend && npm run strapi -- console < permission-script.js
```

### Common File Locations:

- API Routes: `app/api/admin/`
- Admin Components: `components/admin/`
- Authentication Utils: `lib/admin-api-client.ts`
- Strapi Bootstrap: `backend/src/bootstrap.ts`
- Permission Scripts: `backend/scripts/`

---

## Security Issues

### CRITICAL: Admin Navigation Exposed on Login Page

**Date**: July 21, 2025  
**Severity**: CRITICAL SECURITY BREACH  
**Description**: Admin login page shows internal navigation sidebar with all admin menu items before authentication, exposing system structure to unauthorized users.

**Root Cause**: Login page inherits from `app/admin/layout.tsx` which includes `AdminLayout` component with sidebar navigation.

**Security Risk**:

- Exposes internal system structure
- Reveals admin functionality to unauthorized users
- Information disclosure vulnerability
- Could aid in reconnaissance attacks

**Solution**:

1. Override the admin layout in login page:

   ```typescript
   // app/admin/login/layout.tsx
   export default function AdminLoginLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html>
         <body>
           {children}
         </body>
       </html>
     );
   }
   ```

2. Ensure login page uses standalone layout without navigation

**Files Modified**: `app/admin/login/layout.tsx`

**Prevention**:

- Always test authentication pages in incognito/private browsing
- Implement layout isolation for authentication pages
- Regular security audits of exposed routes

---

_Last Updated: July 21, 2025_  
_Next Review: When new errors are encountered or resolved_

## Changelog

### July 21, 2025

- **CRITICAL SECURITY FIX**: Resolved admin navigation exposure on login page
- **RUNTIME ERROR FIX**: Fixed "games.map is not a function" error in GameList component
- Created comprehensive error solutions document
- Added prevention checklists and debugging tools
- Resolved 403 Forbidden errors in game creation API
- Fixed Frontend_Admin role permissions in Strapi
- Removed CSRF validation issues
- Fixed field name mismatches (title vs name)
- Added thumbnail upload functionality
