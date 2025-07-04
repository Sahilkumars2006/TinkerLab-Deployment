# KIT Tinker Lab Management System

## Deployment Guide for GitHub

### Quick Start

1. **Upload to GitHub**
   - Create a new repository on GitHub
   - Upload all files from this folder to your repository
   - Ensure all environment variables are set

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your database and authentication credentials

3. **Deploy**
   ```bash
   npm install
   npm run build
   npm start
   ```

### Environment Variables Required

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Replit Auth)
SESSION_SECRET=your-secure-session-secret-here
REPLIT_DOMAINS=your-domain.com
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc

# Environment
NODE_ENV=production
PORT=5000
```

### Platform-Specific Deployment

#### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

#### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist/client`
4. Set environment variables

#### Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Use start command: `npm start`

#### Docker Deployment
```bash
docker build -t tinkerlab-app .
docker run -p 5000:5000 --env-file .env tinkerlab-app
```

### Key Features
- Equipment reservation system
- Multi-role user management
- Real-time notifications
- Analytics dashboard
- PostgreSQL database integration
- Replit authentication

### Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: Replit Auth (OpenID Connect)
- UI: Tailwind CSS + shadcn/ui

### Troubleshooting

#### Blank Screen Issue
If you see a blank screen:
1. Check environment variables are set correctly
2. Ensure DATABASE_URL is accessible
3. Check build output in `dist/` folder
4. Verify authentication domain settings

#### Database Connection
1. Ensure PostgreSQL database is accessible
2. Run migrations: `npm run db:push`
3. Check database credentials in environment

### Support
For issues with deployment, check the console logs and ensure all environment variables are properly configured.