# 🚀 Quick Start: Render + Vercel Deployment

**Get your app live in 20-30 minutes**

---

## 📋 The Plan

```
1️⃣  Deploy Backend (Render)     ← 10 min
2️⃣  Deploy Frontend (Vercel)    ← 10 min  
3️⃣  Connect Them                ← 5 min
4️⃣  Test                        ← 5 min
```

---

## ⚡ Quick Start

### 1. Push to GitHub (if not done)
```bash
cd /Users/hemanialaparthi/Desktop/estiMate
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy Backend to Render (10 minutes)

1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. Click **"New +" → "Web Service"**
3. Select your **estiMate** repository
4. Fill in:
   - **Name**: `estimate-api`
   - **Root Directory**: `server` ⚠️
   - **Build Command**: `npm run build --workspace=server`
   - **Start Command**: `npm start --workspace=server`
   - **Environment Variables** (click "Add"):
     ```
     JWT_SECRET=<your-jwt-secret-here>
     GITHUB_TOKEN=<your-github-personal-access-token>
     NODE_ENV=production
     ```
     
     ⚠️ Generate your own tokens - never use committed secrets!
5. Click **"Create Web Service"**
6. Wait for ✅ **"Your service is live"**
7. **Copy your URL**: `https://estimate-api-xxx.onrender.com`

### 3. Deploy Frontend to Vercel (10 minutes)

1. Go to **[vercel.com/new](https://vercel.com/new)** → Sign in with GitHub
2. Click **"Import Git Repository"**
3. Select your **estiMate** repo
4. Fill in:
   - **Root Directory**: `client` ⚠️
   - **Build Command**: `npm run build --workspace=client`
   - **Output Directory**: `dist`
   - **Environment Variable** (click "Add"):
     ```
     VITE_API_URL = https://estimate-api-xxx.onrender.com
     ```
     (Replace with your actual Render URL)
5. Click **"Deploy"**
6. Wait for ✅ deployment complete
7. **Copy your URL**: `https://estimate-xxx.vercel.app`

### 4. Update Backend CORS (2 minutes)

Edit `server/src/index.ts`:

Find this line:
```typescript
const allowedOrigins = [
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
```

Add your Vercel URL:
```typescript
const allowedOrigins = [
    'https://estimate-xxx.vercel.app',  // ← ADD THIS
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
```

Then:
```bash
git add server/src/index.ts
git commit -m "Update CORS for Vercel"
git push origin main
```

Render will auto-redeploy! ✅

### 5. Test (5 minutes)

1. Open your Vercel URL: `https://estimate-xxx.vercel.app`
2. Try logging in
3. Open DevTools (F12) → Network tab
4. Check that API requests go to your Render URL
5. See ✅ Login successful or ❌ Error (both are expected)

---

## 🎯 What You Should See

### ✅ Success Indicators
- [ ] Vercel URL loads (shows login page)
- [ ] No blank page or errors
- [ ] Can type in email/password fields
- [ ] Submit button works
- [ ] Network tab shows requests to Render API
- [ ] No CORS errors in console

### ❌ Common First-Time Errors
- "Cannot reach API" → Backend is still building (wait 2 min)
- "CORS error" → Not added Vercel URL to backend `allowedOrigins`
- "Blank page" → Check browser console (F12) for errors
- "404 on login" → Wrong Render URL in `VITE_API_URL`

---

## 🔗 Your URLs

**Note these down:**

| Service | URL |
|---------|-----|
| **Frontend** | https://estimate-xxx.vercel.app |
| **Backend API** | https://estimate-api-xxx.onrender.com |

---

## 📞 Gotchas & Solutions

### Backend keeps telling me to "Enable CORS"
→ You need to update `allowedOrigins` in `server/src/index.ts`

### Everything was working but now API returns 404
→ Render free tier goes to sleep after 15 min. First request takes 30 sec.

### Environment variables aren't working
→ Double-check spelling in Render dashboard (case-sensitive!)

### How do I update my app after deployment?
→ Just `git push origin main`. Both services auto-redeploy!

---

## 📚 Full Documentation

For more details, see:
- **Backend**: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)  
- **Frontend**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Full Setup**: [RENDER_VERCEL_SETUP.md](RENDER_VERCEL_SETUP.md)

---

## ✨ You're Done!

Your app is now:
- 🌐 **Live on the internet**
- 🔐 **Secure with authentication**
- 📱 **Accessible from anywhere**
- 🚀 **AutoDeploys on every git push**

**Share your Vercel URL with your team!**

---

## 🎉 Next Steps

After everything works:
1. Share the Render URL docs with your team (for team-tier)
2. Set up a custom domain (optional, Vercel has it built in)
3. Monitor logs and performance (check Render/Vercel dashboards)
4. Keep env variables secure (never commit .env files)
5. Update features = just `git push`

---

💡 **ProTip**: If you're on free tier and backend sleeps, upgrade to **Starter Pro** ($7/month) for always-on hosting.

**Happy deploying! 🚀**
