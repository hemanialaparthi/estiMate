# Render → Vercel Integration Guide

Complete workflow to deploy both backend (Render) and frontend (Vercel).

---

## 📋 Overview

```
Step 1: Deploy Backend to Render          (5-10 min)
   ↓
Step 2: Get Render API URL               (copy the URL)
   ↓
Step 3: Deploy Frontend to Vercel        (5-10 min)
   ↓
Step 4: Connect Frontend to Backend       (1 min)
   ↓
Step 5: Test Everything                  (5 min)
```

---

## ✅ Step-by-Step

### 1️⃣ Deploy Backend to Render (5-10 minutes)

**Follow**: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

**TL;DR**:
- Go to [render.com](https://render.com)
- Click "New → Web Service"
- Connect GitHub repo
- Set Root Directory: `server`
- Build Command: `npm run build --workspace=server`
- Start Command: `npm start --workspace=server`
- Add Environment Variables (JWT_SECRET, GITHUB_TOKEN, etc.)
- Click "Deploy"
- Wait for ✅ "Your service is live"

**Result**: Get your API URL
```
https://estimate-api.onrender.com
```

---

### 2️⃣ Update Backend CORS (1 minute)

Your backend needs to allow requests from your Vercel frontend.

In `server/src/index.ts`, update `allowedOrigins`:

```typescript
const allowedOrigins = [
    'https://estimate-xxx.vercel.app',  // ← Add your Vercel URL here
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
];
```

**Then push to GitHub**:
```bash
git add server/src/index.ts
git commit -m "Update CORS for Vercel domain"
git push origin main
```

Render will auto-redeploy from GitHub.

---

### 3️⃣ Deploy Frontend to Vercel (5-10 minutes)

**Follow**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) or [VERCEL_CHECKLIST.md](VERCEL_CHECKLIST.md)

**TL;DR**:
- Go to [vercel.com/new](https://vercel.com/new)
- Import GitHub repo
- Set Root Directory: `client`
- Build Command: `npm run build --workspace=client`
- Output Directory: `dist`
- Add Environment Variable:
  ```
  VITE_API_URL = https://estimate-api.onrender.com
  ```
- Click "Deploy"
- Get your Vercel URL:
  ```
  https://estimate-xxx.vercel.app
  ```

---

### 4️⃣ Connect Frontend to Backend (30 seconds)

The frontend is already configured to use `VITE_API_URL` environment variable.

Just ensure it's set correctly in Vercel:

1. Vercel Dashboard → Your project → Settings
2. Environment Variables
3. Verify: `VITE_API_URL = https://estimate-api.onrender.com`
4. If changed, Vercel auto-redeploys

---

### 5️⃣ Test Everything (5 minutes)

#### Test 1: Frontend Loads
```
Go to: https://your-app.vercel.app
See: Login/signup page
```

#### Test 2: Backend Responds
```
Open DevTools (F12) → Network tab
Try logging in
Watch for API calls to https://estimate-api.onrender.com/api/auth/login
Status should be 200-400 (not CORS errors)
```

#### Test 3: Full Workflow
- [ ] See login page
- [ ] Enter valid email/password
- [ ] See success message (or error from backend)
- [ ] Get redirected to dashboard (if success)
- [ ] See data loading (projects, estimates, etc.)
- [ ] No errors in browser console (F12)

---

## 🔗 Your Live Architecture

```
┌──────────────────────────────┐
│  https://estimate-xxx.vercel.app
│   (React Frontend)
│   Shows UI, handles login
└──────────────┬───────────────┘
               │
               │ API calls to
               │
        ┌──────▼────────────────┐
        │ https://estimate-api.onrender.com
        │   (Express Backend)
        │   Database, business logic
        └───────────────────────┘
```

---

## 🆘 Troubleshooting

### Frontend shows blank page or errors
1. Check browser console (F12) for errors
2. Verify `VITE_API_URL` is set in Vercel env vars
3. Confirm Render backend is running

### API calls return 404
1. Verify backend routes exist (e.g., `/api/auth/login`)
2. Check Render logs for errors
3. Make sure `VITE_API_URL` doesn't have trailing slash

### CORS errors in console
1. Add Vercel domain to `allowedOrigins` in backend
2. Redeploy backend (push to GitHub)
3. Wait 2-3 minutes for Render to restart

### Login fails but form works
1. Check Render logs (Render Dashboard → Logs)
2. Verify database is initialized
3. Check JWT_SECRET and GITHUB_TOKEN are set

### Backend goes to sleep (Free tier)
1. Upgrade to Starter Pro ($7/month) on Render
2. Or accept 30-second cold starts
3. First request after inactivity = slow

---

## 📊 Cost

| Service | Free Tier | Paid Tier | Cost |
|---------|-----------|-----------|------|
| **Vercel** | Included | Pro | $20/month |
| **Render** | Free | Starter Pro | $7/month |
| **Total** | Free | $27/month | - |

Free tiers are enough for testing/development.

---

## ✨ You're Live!

After these steps:
- ✅ Frontend is live at Vercel
- ✅ Backend API is live at Render
- ✅ Everything is connected
- ✅ Users can access your app
- ✅ All features work

**Share your Vercel URL with your team!** 🚀

---

## 🔄 Updates & Changes

### To update the frontend:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-redeploys
```

### To update the backend:
```bash
git add .
git commit -m "Fix backend"
git push origin main
# Render auto-redeploys
```

### To change API URL:
1. Update `VITE_API_URL` in Vercel env vars
2. Optionally update `client/.env.production`
3. Vercel auto-redeploys

---

## 📞 Need Help?

- **Vercel Issues**: Check [vercel.com/docs](https://vercel.com/docs)
- **Render Issues**: Check [render.com/docs](https://render.com/docs)
- **CORS Problems**: Make sure Vercel URL is in `allowedOrigins`
- **Environment Variables**: Double-check spelling and values

---

**Your app is live! Celebrate! 🎉**
