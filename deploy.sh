#!/bin/bash

echo "🚀 Starting TinkerLab Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build failed! Check the build output above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables in Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "2. Test the deployment by visiting your Vercel URL"
echo "3. Try logging in with any email/password combination" 