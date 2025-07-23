# Admin Authentication Issues and Solutions

## Common Issues

### 1. Session Termination on Games Page Navigation

**Issue**: Users are logged out when navigating to the /games page.

**Potential Causes**:

1. Token refresh mechanism failing
2. Invalid token format
3. Missing or expired cookies
4. CORS issues with API requests
5. Middleware incorrectly handling auth state

**Solutions**:

1. Ensure token refresh is properly configured:

   ```typescript
   // middleware.ts
   export async function middleware(request: NextRequest) {
     if (isAdminRoute(request.nextUrl.pathname)) {
       const token = request.cookies.get("admin_token")?.value;
       const refreshToken = request.cookies.get("admin_refresh_token")?.value;

       if (!token) {
         if (!refreshToken) {
           return redirectToLogin(request);
         }
         // Try to refresh the token
         const refreshed = await refreshAdminToken(refreshToken);
         if (!refreshed) {
           return redirectToLogin(request);
         }
       }

       // Verify token
       const verified = await verifyAdminToken(token);
       if (!verified) {
         return redirectToLogin(request);
       }
     }
     return NextResponse.next();
   }
   ```

2. Proper cookie configuration:

   ```typescript
   // app/api/admin/auth/login/route.ts
   response.cookies.set("admin_token", token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "strict",
     maxAge: 7 * 24 * 60 * 60, // 7 days
     path: "/",
   });
   ```

3. Correct token validation in Strapi:

   ```typescript
   // backend/src/api/admin/controllers/admin-auth.ts
   async verify(ctx) {
     try {
       const token = ctx.request.header.authorization?.replace("Bearer ", "");
       if (!token) return ctx.unauthorized("No token provided");

       const decoded = await strapi.plugins["users-permissions"].services.jwt.verify(token);
       const admin = await strapi.db.query("api::platform-admin.platform-admin").findOne({
         where: { id: decoded.adminId },
         select: ["id", "isActive", "adminRole", "accessLevel"],
       });

       if (!admin || !admin.isActive) {
         return ctx.unauthorized("Invalid or inactive admin account");
       }

       return ctx.send({ valid: true, admin });
     } catch (error) {
       return ctx.unauthorized("Invalid token");
     }
   }
   ```

### 2. Console Errors in Dashboard

**Issue**: Console shows authentication/authorization errors.

**Solutions**:

1. Implement proper error handling in API routes
2. Add request interceptors for token refresh
3. Improve error logging and monitoring

### 3. Token Refresh Issues

**Issue**: Access tokens not refreshing properly.

**Solutions**:

1. Store refresh tokens securely
2. Implement proper token rotation
3. Handle token expiry gracefully

## Best Practices

1. **Token Management**:

   - Use short-lived access tokens (7 days)
   - Use longer-lived refresh tokens (30 days)
   - Store tokens in HTTP-only cookies
   - Implement token rotation

2. **Error Handling**:

   - Log authentication errors
   - Provide clear user feedback
   - Handle network issues gracefully

3. **Security**:
   - Use HTTPS in production
   - Implement rate limiting
   - Set secure cookie options
   - Validate tokens on both client and server

## Testing

1. Run integration tests:

   ```bash
   npm run test:integration
   ```

2. Monitor auth-related issues:
   ```bash
   npm run test:auth
   ```

## Troubleshooting Steps

1. Check browser console for errors
2. Verify token presence in cookies
3. Check network requests for auth headers
4. Verify token expiry times
5. Check server logs for auth errors

## Recent Fixes

### 2024-01-21: Token Refresh Implementation

- Added proper token refresh mechanism
- Fixed cookie handling
- Updated middleware for better auth checks

### 2024-01-21: Activity Model Fix

- Removed invalid relation in activity schema
- Updated platform admin schema
- Fixed database migration issues

## Monitoring

1. Set up error tracking for auth issues
2. Monitor failed login attempts
3. Track token refresh rates
4. Monitor session durations

## Future Improvements

1. Implement session management
2. Add real-time token validation
3. Improve error reporting
4. Add automated testing for auth flows
