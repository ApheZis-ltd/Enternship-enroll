#!/bin/bash

# Configuration
APP_DIR="/var/www/enternship-enroll"
BRANCH="master"

echo "🚀 Starting Deployment..."

# Navigate to app directory
cd $APP_DIR || { echo "❌ Directory $APP_DIR not found"; exit 1; }

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git fetch --all
git checkout -B $BRANCH origin/$BRANCH
git reset --hard origin/$BRANCH

# Install dependencies (production only)
echo "📦 Installing dependencies..."
npm install --production

# Restart application with PM2
if command -v pm2 &> /dev/null; then
    echo "♻️ Restarting application with PM2..."
    pm2 restart enternship-enroll || pm2 start server/server.js --name enternship-enroll
else
    echo "⚠️ PM2 not found. Restarting with Node (not recommended for production)..."
    pkill -f "node server/server.js"
    nohup node server/server.js > server.log 2>&1 &
fi

echo "✅ Deployment Complete!"
