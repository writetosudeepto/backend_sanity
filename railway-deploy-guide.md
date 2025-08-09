# 🚂 Deploy to Railway - Complete Guide

## Step 1: Prepare for Deployment ✅
Your project is ready! I've updated the `package.json` with the correct start script.

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add webhook server for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect and deploy

### Option B: Deploy with Railway CLI
1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway up
   ```

## Step 3: Set Environment Variables
In Railway dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add these variables:
   - `DISCORD_WEBHOOK_URL`: `https://discordapp.com/api/webhooks/1403747903822102610/Xz5GTjKz_UUSOjOZM1m13_boO_KgGTBApnwxfxf0CB9e89C2lWd0Q0pL9Ewc-cT3IFqt`
   - `SANITY_WEBHOOK_SECRET`: `portfolio-contact-webhook-2025`
   - `PORT`: `3001` (optional)

## Step 4: Get Your Production URL
After deployment, Railway gives you a URL like:
`https://your-project-name.up.railway.app`

## Step 5: Update Sanity Webhook
1. Go to https://sanity.io/manage → Your Project → API → Webhooks
2. **Update URL to**: `https://your-project-name.up.railway.app/webhook/contact`
3. Keep other settings the same

## Step 6: Test Production
Create a new contact in Sanity Studio to test the production webhook!

---

## 📁 Files to Include in Deployment
Make sure these files are in your repository:
- ✅ `webhook-server.js`
- ✅ `package.json` (updated)
- ✅ `.env.example` (for documentation)
- ❌ `.env` (don't commit this - use Railway variables instead)

## 🔐 Security Notes
- Never commit `.env` file to GitHub
- Use Railway's environment variables for secrets
- The webhook secret ensures only Sanity can trigger notifications

## 💡 Railway Benefits
- ✅ Free tier: 500 execution hours/month
- ✅ Automatic deploys from GitHub
- ✅ Built-in environment variables
- ✅ Custom domains available
- ✅ 24/7 uptime (no sleeping like Heroku)