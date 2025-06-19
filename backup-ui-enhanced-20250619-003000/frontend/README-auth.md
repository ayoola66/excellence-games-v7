# Authentication Implementation

## Overview
This implementation addresses the 403 Forbidden errors, authentication token validation failures, and enhances the user registration process by implementing a robust authentication system using NextAuth.js integrated with the Strapi backend.

## Key Components

### Authentication Configuration
- `lib/auth.ts`: NextAuth configuration with Credentials provider
- `app/api/auth/[...nextauth]/route.ts`: NextAuth API route handler
- `lib/axios.ts`: Axios instance with authentication interceptors
- `middleware.ts`: Route protection middleware

### User Management
- `app/auth/login/page.tsx`: Login page with error handling
- `app/auth/register/page.tsx`: Registration page with validation
- `app/auth/logout/page.tsx`: Logout functionality
- `app/auth/error/page.tsx`: Authentication error handling

### Protected Routes
- `app/user/profile/page.tsx`: User profile with subscription status
- `app/user/games/page.tsx`: Games listing with premium indicators
- `app/user/subscription/page.tsx`: Premium subscription management
- `app/game/[id]/page.tsx`: Game page with access control

### API Routes
- `app/api/games/[id]/route.ts`: Protected game data endpoint
- `app/api/users/me/upgrade-premium/route.ts`: Premium upgrade endpoint

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install next-auth@4.24.5 axios
   ```

2. **Environment Variables**
   Add the following to your `.env.local` file:
   ```
   NEXTAUTH_SECRET=your_secure_secret_here
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
   ```

3. **Strapi Configuration**
   Ensure your Strapi backend has:
   - User collection with `premium` field (boolean)
   - Game collection with `status` field (enum: 'free', 'premium')
   - Appropriate permissions for authenticated users

## Usage

### Authentication Flow
1. User registers or logs in
2. NextAuth creates and manages JWT token
3. Token is used for API requests
4. Protected routes check authentication status

### Premium Content Access
1. User attempts to access premium content
2. System checks user's premium status
3. If premium, access is granted
4. If not premium, user is redirected to subscription page

### Error Handling
- Authentication errors redirect to error page
- API errors return appropriate status codes
- User-friendly error messages are displayed

## Testing

1. **Authentication Flow**
   - Test registration with valid/invalid data
   - Test login with correct/incorrect credentials
   - Verify token generation and validation
   - Test session persistence across page reloads

2. **Protected Routes**
   - Verify unauthenticated users are redirected to login
   - Check that authenticated users can access appropriate routes
   - Test that premium content is properly restricted

3. **API Protection**
   - Verify API routes reject unauthenticated requests
   - Test that premium content checks work correctly
   - Confirm error responses are appropriate

## Troubleshooting

### Common Issues
1. **403 Forbidden Errors**
   - Check that the JWT token is being sent correctly
   - Verify user has appropriate permissions in Strapi

2. **Authentication Failures**
   - Ensure NEXTAUTH_SECRET is properly set
   - Check that credentials are correct

3. **Session Issues**
   - Clear browser cookies and try again
   - Verify session configuration in NextAuth 