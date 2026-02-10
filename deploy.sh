!/bin/bash
# 🚀 PERMANENT DEPLOYMENT SCRIPT
# This forces server to match GitHub exactly

echo "🚀 Starting deployment..."

cd /var/www/enternship-enroll || { echo "❌ Cannot enter directory"; exit 1; }

# 1. Stop app
echo "🛑 Stopping application..."
pm2 delete enternship-enroll 2>/dev/null || true

# 2. Force sync with GitHub
echo "🔄 Force syncing with GitHub..."
git fetch origin --force
git reset --hard origin/master
git clean -fdx

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production --no-audit

# 4. Start app
echo "♻️ Starting application..."
pm2 start server/server.js --name enternship-enroll

# 5. Verify
echo "✅ Verifying deployment..."
sleep 3

if curl -s -f http://localhost:3000 > /dev/null; then
    echo "🎉 Deployment successful!"
    echo "📊 Status:"
    pm2 status enternship-enroll
    echo "📝 Latest commit: $(git log -1 --oneline)"
else
    echo "❌ Deployment failed!"
    pm2 logs enternship-enroll --lines 10
    exit 1
fi
