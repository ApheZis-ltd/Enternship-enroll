#!/bin/bash

echo "🚀 Starting full deployment..."

APP_DIR="/var/www/enternship-enroll"
cd "$APP_DIR" || exit 1

# 1. Pull ALL files from GitHub
echo "📥 Pulling all files from GitHub..."
git fetch origin
git reset --hard origin/master

# 2. Ensure public folder exists and has correct files
echo "📁 Ensuring public folder is up to date..."
if [ -d "public" ]; then
    # Check if public folder is tracked in git
    if git ls-tree --name-only HEAD | grep -q "^public/"; then
        echo "✅ Public folder is tracked in git, pulling latest..."
        git checkout origin/master -- public/
    else
        echo "⚠️ Public folder not in git, checking for updates..."
        # If you have a frontend build process, add it here
        # npm run build
    fi
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production --no-audit

# 4. Restart app
echo "♻️ Restarting application..."
pm2 delete enternship-enroll 2>/dev/null || true
pm2 start server/server.js --name enternship-enroll

# 5. Verify
sleep 2
echo "✅ Deployment complete!"
echo "📊 Status:"
pm2 status enternship-enroll