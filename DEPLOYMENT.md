# TinkerLab Deployment Guide

## Issues Fixed

### 1. 404 Error
- **Problem**: Vercel configuration was pointing to `dist/client` but Vite builds to `dist/public`
- **Solution**: Updated `vercel.json` to use correct build directory
- **Files Modified**: `vercel.json`, `server/vite.ts`

### 2. Home Page Button Issue
- **Problem**: The "Sign In to Continue" button redirects to `/api/login` which uses Replit authentication
- **Solution**: Need to configure environment variables or switch to a different auth provider

## Environment Variables Required

You need to set these environment variables in your Vercel deployment:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# Session
SESSION_SECRET=your_random_session_secret

# Replit Authentication (if using Replit)
REPLIT_DOMAINS=your-domain.vercel.app
REPL_ID=your_replit_id
ISSUER_URL=https://replit.com/oidc

# Alternative: Use a different auth provider
# For example, Auth0, NextAuth, or custom JWT authentication
```

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Configure Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables listed above

## Alternative Authentication Setup

If you're not using Replit, you can modify the authentication to use a different provider:

### Option 1: Simple JWT Authentication
Replace the Replit auth with a simple JWT-based system:

```typescript
// server/simpleAuth.ts
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const createToken = (user: any) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Option 2: Auth0 Integration
Use Auth0 for authentication:

```bash
npm install @auth0/auth0-react
```

## Testing the Deployment

1. **Check the build output**:
   ```bash
   ls -la dist/public/
   ```

2. **Verify static files are served**:
   - Visit your deployed URL
   - Check browser console for any 404 errors
   - Verify the "Sign In" button works

3. **Test API endpoints**:
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

## Common Issues and Solutions

### Issue: Still getting 404 errors
**Solution**: 
1. Check that the build completed successfully
2. Verify `dist/public/index.html` exists
3. Ensure all environment variables are set

### Issue: Authentication not working
**Solution**:
1. If using Replit auth: Make sure `REPLIT_DOMAINS` matches your Vercel domain
2. If using alternative auth: Update the auth configuration in `server/routes.ts`

### Issue: Database connection errors
**Solution**:
1. Verify `DATABASE_URL` is correctly set
2. Ensure your database is accessible from Vercel
3. Check that the database schema is up to date

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and schema updated
- [ ] Build completes without errors
- [ ] Static files are served correctly
- [ ] API endpoints respond properly
- [ ] Authentication flow works
- [ ] WebSocket connections work (if needed)

## Support

If you continue to experience issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test locally with `npm run dev` first
4. Check browser console for client-side errors 