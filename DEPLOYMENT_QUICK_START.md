# Quick Deployment Guide

## Issues Fixed ✅

1. **404 Error**: Fixed Vercel configuration to use correct build directory (`dist/public`)
2. **Home Page Button**: Updated to use simple JWT authentication instead of Replit auth
3. **Build Configuration**: Updated static file serving path

## Quick Deploy Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Configure Environment Variables
In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_random_secret_key
```

## Testing the Fix

1. **Visit your deployed URL**
2. **Click "Sign In to Continue"** - should now show a login prompt
3. **Enter any email and password** - the simple auth accepts any credentials for demo
4. **You should be redirected to the dashboard**

## What Was Fixed

### Before (Issues):
- ❌ 404 errors due to wrong build directory in `vercel.json`
- ❌ Home page button redirected to Replit auth (doesn't work on Vercel)
- ❌ Static file serving looked in wrong directory

### After (Fixed):
- ✅ Correct build directory configuration
- ✅ Simple JWT authentication that works on Vercel
- ✅ Proper static file serving
- ✅ Working login flow

## Files Modified

1. `vercel.json` - Fixed build directory paths
2. `server/vite.ts` - Fixed static serving path
3. `server/simpleAuth.ts` - New simple JWT auth system
4. `server/routesSimple.ts` - Routes using simple auth
5. `server/indexSimple.ts` - Server using simple auth
6. `client/src/pages/landing.tsx` - Updated login button
7. `client/src/hooks/useAuth.ts` - Updated auth hook
8. `package.json` - Added JWT dependencies

## Demo Login

For testing, you can use any email and password combination:
- Email: `demo@example.com`
- Password: `password123`

The simple authentication system accepts any credentials for demonstration purposes.

## Troubleshooting

If you still get 404 errors:
1. Check that the build completed successfully
2. Verify `dist/public/index.html` exists
3. Ensure environment variables are set in Vercel

If authentication doesn't work:
1. Check browser console for errors
2. Verify the API endpoints are responding
3. Check that JWT_SECRET is set in environment variables 