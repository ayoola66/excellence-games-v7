# Manual Fix for Game Creation Issues

Since the automated scripts require valid Strapi admin credentials, here's a manual approach to fix the game creation issues:

## 1. Generate a Strapi API Token Manually

1. Log in to your Strapi admin panel at http://localhost:1337/admin
2. Go to Settings > API Tokens
3. Click "Create new API Token"
4. Fill in the details:
   - Name: NextJS Admin Token
   - Description: Token for NextJS admin dashboard
   - Token duration: Unlimited
   - Token type: Full access
5. Click "Save"
6. Copy the generated token (you'll only see it once)

## 2. Set the Token in Your .env.local File

Run the set-token script with your token:

```bash
node scripts/set-token.js YOUR_TOKEN_HERE
```

Or manually create/edit your .env.local file and add:

```
STRAPI_ADMIN_TOKEN=YOUR_TOKEN_HERE
```

## 3. Fix Permissions in Strapi

1. Log in to your Strapi admin panel
2. Go to Settings > Users & Permissions Plugin > Roles
3. Click on the "Authenticated" role
4. Find the "Game" section and enable all permissions:
   - count
   - create
   - delete
   - find
   - findOne
   - update
5. Find the "Category" section and enable all permissions
6. Save the changes
7. If you have a "Frontend_Admin" role, repeat steps 3-6 for that role as well

## 4. Restart Your Servers

1. Restart your Strapi server:

```bash
cd backend
npm run develop
```

2. Restart your Next.js server:

```bash
npm run dev
```

## 5. Test Game Creation

1. Log in to your Next.js admin dashboard at http://localhost:3000/admin
2. Go to Games
3. Click "Create New Game"
4. Fill in the details and submit

## Troubleshooting

If you're still having issues:

### Check the Network Tab in Browser DevTools

1. Open your browser's Developer Tools (F12)
2. Go to the Network tab
3. Try creating a game and observe the request/response
4. Look for any errors in the response

### Check Strapi Logs

Look for errors in your Strapi server logs. Common issues:

- "Cannot read properties of undefined (reading 'find')": Database or model issue
- "Method Not Allowed": Route or permission issue
- "Unauthorized" or "Forbidden": Authentication or permission issue

### Check Field Names

Make sure the field names in your frontend match the backend schema:

- Frontend uses `imageUrl` (not `thumbnail`) for the image field
- All required fields are included in the request
