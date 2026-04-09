# Deploy estiMate Backend to Render.com

Render.com is perfect for deploying your Express backend. Here's how to do it step-by-step.

## 📋 Prerequisites

- [ ] Render account (create free at [render.com](https://render.com))
- [ ] GitHub account with your estiMate repo pushed
- [ ] `.env` file with your environment variables

---

## 🚀 Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify email
5. You'll land in the Render Dashboard

---

## 📦 Step 2: Create a New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect account"** to connect GitHub
5. Authorize Render to access your GitHub account
6. Select your **estiMate** repository
7. Click **"Connect"**

---

## ⚙️ Step 3: Configure the Service

Fill in the configuration form:

### Basic Settings

| Setting | Value |
|---------|-------|
| **Name** | `estimate-api` (or any name) |
| **Environment** | `Node` |
| **Region** | Select closest to your users (e.g., `us-west`) |
| **Branch** | `main` |
| **Root Directory** | `server` ⚠️ **Important!** |

### Build Settings

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build --workspace=server` |
| **Start Command** | `npm start --workspace=server` |

### Environment Variables

Click **"Add Environment Variable"** and add each one:

```
JWT_SECRET=<your-jwt-secret-here>
GITHUB_TOKEN=<your-github-personal-access-token>
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=production
```

**Important**: 
- **CLIENT_URL**: Use `http://localhost:5173` for now. After you deploy Vercel, update this to your Vercel URL (e.g., `https://your-app.vercel.app`)
- **JWT_SECRET & GITHUB_TOKEN**: Generate your own - never commit real secrets to git
- ⚠️ The tokens that were in this file have been regenerated
- NODE_ENV=production optimizes for production

### CLIENT_URL Timeline
1. **Now (Render deployment)**: `http://localhost:5173` (for local testing)
2. **After Vercel deployment**: Update to your Vercel URL (e.g., `https://estimate-xxx.vercel.app`)
3. **To update later**: Render Dashboard → Your Service → Environment → Edit CLIENT_URL → Save (auto-redeploys)

### Instance Type

- **Free tier**: Available (but may sleep after 15 min inactivity)
- **Pro tier**: $7/month (recommended for production, always on)

For testing, use **Free**. For production, use **Starter Pro**.

---

## ✅ Step 4: Deploy

1. Scroll down and click **"Create Web Service"**
2. Render will:
   - Build your backend (`npm run build`)
   - Start the server (`npm start`)
   - Assign a public URL

3. Wait for deployment (2-5 minutes)
4. You'll see: ✅ **"Your service is live"**

---

## 🔗 Step 5: Get Your API URL

After deployment, Render shows your public URL at the top:

```
https://estimate-api.onrender.com
```

This is your `VITE_API_URL` for the Vercel frontend!

---

## 🧪 Step 6: Test Your API

### Test 1: Health Check
```bash
curl https://estimate-api.onrender.com/
```

Should return something (depends on your root endpoint)

### Test 2: Login Endpoint
```bash
curl -X POST https://estimate-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

Should return error or success (depends on your database)

### Test 3: CORS Check
Open browser DevTools and check Network tab:
- Should NOT see CORS errors
- Status codes should be 200, 400, 500 (not CORS issues)

---

## 🔄 Step 7: Use Backend URL in Vercel

Now that your backend is live at `https://estimate-api.onrender.com`:

1. Go to [vercel.com](https://vercel.com)
2. Select your `estimate-client` project
3. Go to **Settings → Environment Variables**
4. Update or add:
   ```
   VITE_API_URL = https://estimate-api.onrender.com
   ```
5. Click **"Save"**
6. Vercel will auto-redeploy your frontend with the new API URL

---

## 🛡️ Update CORS in Backend

Since your Vercel app has a new URL, update `server/src/index.ts`:

Find the `allowedOrigins` array and add your Vercel URL:

```typescript
const allowedOrigins = [
    'https://your-vercel-app.vercel.app',  // ← Add this
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
];
```

Replace `your-vercel-app` with your actual Vercel domain.

---

## 📊 Monitoring Your Render Service

### View Logs
- Render Dashboard → Select service → **Logs** tab
- See real-time server output
- Helpful for debugging issues

### View Metrics
- Dashboard → **Metrics** tab
- Monitor CPU, memory, API requests
- Free tier shows limited data

### Auto Redeploy
On **Render Dashboard** → **Settings** → **Auto-Deploy**:
- ✅ **Enabled** (default): Any push to main branch redeploys
- ❌ **Disabled**: Manual redeploy only

---

## ⚠️ Common Issues & Solutions

### Service Won't Start
**Error**: "Build failed" or "Start command failed"

**Solutions**:
1. Check build logs for errors
2. Verify `Build Command` is correct: `npm run build --workspace=server`
3. Verify `Start Command` is correct: `npm start --workspace=server`
4. Ensure `Root Directory` is set to `server`

### Database Connection Error
**Error**: "Cannot connect to database"

**Solutions**:
1. Docker check if using SQLite (should just work)
2. If using PostgreSQL, ensure `DATABASE_URL` env var is set
3. Current setup uses SQLite3 which works on Render

### Environment Variables Not Working
**Error**: "Undefined variable" in logs

**Solutions**:
1. Verify env vars are set in Render dashboard
2. Don't wrap values in quotes in Render UI
3. Restart the service after adding env vars:
   - **Logs** tab → 3-dot menu → **Restart service**

### CORS Errors from Frontend
**Error**: "Access to XMLHttpRequest blocked by CORS"

**Solutions**:
1. Add your Vercel URL to `allowedOrigins` in `server/src/index.ts`
2. Redeploy backend: push to GitHub → Render auto-deploys
3. Clear browser cache and reload

### Service Goes to Sleep (Free Tier)
**Issue**: First request takes 30+ seconds

**Why**: Free tier services spin down after 15 minutes inactivity

**Solutions**:
1. Upgrade to **Starter Pro** ($7/month) for always-on
2. Use a monitoring service to ping every 15 minutes
3. Accept slower cold starts for development

---

## 🚀 Production Checklist

- [ ] **Name**: `estimate-api` (memorable and professional)
- [ ] **Region**: Closest to users
- [ ] **Plan**: Free (testing) or Pro (production)
- [ ] **Build Command**: `npm run build --workspace=server`
- [ ] **Start Command**: `npm start --workspace=server`
- [ ] **Root Directory**: `server`
- [ ] **Environment Variables**: All set (JWT_SECRET, etc.)
- [ ] **CORS**: Updated with Vercel URL
- [ ] **Tests**: Endpoints tested with curl/browser
- [ ] **Logs**: Monitored for errors
- [ ] **Frontend**: Updated VITE_API_URL and redeployed

---

## 📱 After Backend is Live

Your complete architecture:

```
┌─────────────────────────┐
│   Browser (Your User)   │
└────────────┬────────────┘
             │
    https://your-app.vercel.app
             │
      ┌──────▼──────┐
      │   Vercel    │  (React frontend)
      │  estimate   │
      └──────┬──────┘
             │
    https://estimate-api.onrender.com/api/*
             │
      ┌──────▼──────┐
      │   Render    │  (Express backend)
      │  estimate   │
      └─────────────┘
```

---

## 💡 Tips for Success

1. **Keep it running**: Use Render's Pro plan for production ($7/month = always on)
2. **Monitor logs**: Check Logs tab regularly for errors
3. **Auto-deploy**: Make sure "Auto-Deploy" is enabled for GitHub updates
4. **Environment variables**: Never commit secrets to GitHub
5. **Test after deploy**: Always test login and API calls after deployment
6. **Cache breaking**: Clear browser cache if seeing old version

---

## 🆘 Troubleshooting

### Still not working after following steps?

1. **Check Render logs**:
   - Dashboard → YourService → Logs
   - Look for error messages during build/start

2. **Test backend directly**:
   ```bash
   curl https://estimate-api.onrender.com/
   ```

3. **Check CORS**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try login and watch for CORS errors

4. **Verify env variables**:
   - Render → YourService → Environment
   - Check all vars are set correctly

5. **Restart service**:
   - Logs tab → 3-dot menu → Restart

---

## 🎉 Success!

Once your Render backend is live:
1. You have a public API URL
2. Frontend on Vercel connects to it
3. Users can access your app at vercel URL
4. All features work (login, estimates, projects, etc.)

**You're now deployed! 🚀**

---

## 📚 Useful Render Links

- [Render Dashboard](https://dashboard.render.com)
- [Render Node.js Docs](https://render.com/docs/deploy-node-express-app)
- [Environment Variables Guide](https://render.com/docs/environment-variables)
- [Render Support](https://render.com/support)
