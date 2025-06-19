# NextAuth Troubleshooting Guide

## Common Issues and Solutions

### 1. 404 Error for `/api/auth/session`

**Error:** `GET http://localhost:3000/api/auth/session 404 (Not Found)`

**Possible causes:**
- The NextAuth API route is not properly set up
- The `.env.local` file is not being loaded
- The application is not finding the route handler

**Solutions:**
1. Ensure you have the proper route handler in `app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import NextAuth from "next-auth";
   // Configuration...
   const handler = NextAuth({...});
   export { handler as GET, handler as POST };
   ```

2. Make sure your `.env.local` file exists (not `env.local`) and contains:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_here
   ```

3. Check that your middleware.ts is properly configured:
   ```typescript
   import { withAuth } from 'next-auth/middleware';
   // Configuration...
   ```

4. Verify that the SessionProvider is properly set up in your app:
   ```typescript
   'use client'
   import { SessionProvider } from 'next-auth/react';
   
   export default function Providers({ children }) {
     return (
       <SessionProvider>
         {children}
       </SessionProvider>
     );
   }
   ```

### 2. "useAuth must be used within an AuthProvider" Error

**Error:** `Error: useAuth must be used within an AuthProvider`

**Solutions:**
1. Make sure your custom AuthProvider is properly set up
2. Ensure the AuthProvider is wrapping your application in the component hierarchy
3. If using both custom AuthContext and NextAuth, ensure they're properly integrated

### 3. Token Not Available in API Calls

**Error:** API calls failing due to missing authorization token

**Solutions:**
1. Update your API client to use the NextAuth session:
   ```typescript
   import { getSession } from 'next-auth/react';
   
   // In your API interceptor
   const session = await getSession();
   if (session?.user?.token) {
     config.headers.Authorization = `Bearer ${session.user.token}`;
   }
   ```

2. Make sure your NextAuth configuration includes the token in the session:
   ```typescript
   callbacks: {
     async jwt({ token, user }) {
       if (user) {
         token.token = user.token;
       }
       return token;
     },
     async session({ session, token }) {
       if (session.user) {
         session.user.token = token.token;
       }
       return session;
     }
   }
   ```

### 4. Type Errors with NextAuth

**Error:** Type errors related to NextAuth types

**Solution:**
Add type declarations to extend NextAuth types:
```typescript
declare module "next-auth" {
  interface User {
    token?: string;
  }
  
  interface Session {
    user?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      token?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token?: string;
  }
}
```

## Diagnostic Steps

1. **Check API Routes:**
   - Visit `/api/auth/session` directly in the browser
   - It should return a JSON response (empty if not logged in)

2. **Verify Environment Variables:**
   - Make sure `.env.local` exists and is properly formatted
   - Restart the development server after changing env variables

3. **Check Network Requests:**
   - Open browser developer tools
   - Look at the Network tab when loading pages
   - Check for 404 errors on NextAuth endpoints

4. **Session Debugging:**
   - Add a simple page that displays the session data:
   ```jsx
   'use client'
   import { useSession } from 'next-auth/react';
   
   export default function DebugPage() {
     const { data: session, status } = useSession();
     return (
       <div>
         <h1>Session Debug</h1>
         <pre>{JSON.stringify({ session, status }, null, 2)}</pre>
       </div>
     );
   }
   ```

5. **Clear Browser Data:**
   - Clear cookies and local storage
   - Try in a private/incognito window

## Next Steps if Issues Persist

1. Simplify your setup to isolate the issue
2. Check for version compatibility between Next.js and NextAuth
3. Review the NextAuth documentation for your specific authentication flow
4. Check GitHub issues for similar problems 