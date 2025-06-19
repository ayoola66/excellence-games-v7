# NextAuth Setup Guide

## Fixing the 404 Error for `/api/auth/session`

If you're seeing a 404 error for `/api/auth/session` and related NextAuth endpoints, follow these steps:

1. **Rename Environment File**
   ```bash
   # Rename the env.local file to .env.local
   mv env.local .env.local
   ```

2. **Restart the Development Server**
   ```bash
   # Stop the current server and restart it
   npm run dev
   ```

3. **Check NextAuth API Routes**
   Ensure that the NextAuth API route handler is properly set up in:
   - `app/api/auth/[...nextauth]/route.ts`

## Troubleshooting the "useAuth must be used within an AuthProvider" Error

This error occurs because there's a conflict between the existing AuthContext and the new NextAuth implementation. The changes we've made to the AuthContext should fix this issue by:

1. Making the AuthContext more forgiving when used outside of an AuthProvider
2. Integrating NextAuth's session with the existing AuthContext
3. Updating the auth layout to use NextAuth's session

## Additional Configuration

1. **Environment Variables**
   Make sure your `.env.local` file contains:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key_change_this_in_production
   NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
   ```

2. **Strapi Configuration**
   Ensure your Strapi backend is properly configured for authentication.

3. **NextAuth Debug Mode**
   If you're still experiencing issues, you can enable debug mode in your `.env.local`:
   ```
   NEXTAUTH_DEBUG=true
   ```

## Common Issues

1. **Missing API Routes**
   If NextAuth API routes are not found, ensure that the file structure is correct:
   ```
   app/
     api/
       auth/
         [...nextauth]/
           route.ts
   ```

2. **Session Not Persisting**
   If sessions are not persisting, check that:
   - The NEXTAUTH_SECRET is properly set
   - The JWT strategy is being used
   - Cookies are not being blocked by the browser

3. **Authentication Failures**
   If authentication is failing:
   - Check that the credentials are correct
   - Verify that the Strapi API is accessible
   - Ensure that the JWT token is being properly stored and sent 