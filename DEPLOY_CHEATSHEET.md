# 🎯 Render + Vercel: One-Page Deployment Recipe

**Print this page or bookmark it!**

---

## Phase 1: Deploy Backend to Render

### Step 1a: Prepare Code
```bash
cd /Users/hemanialaparthi/Desktop/estiMate
git add .
git commit -m "Ready for Render"
git push origin main
```

### Step 1b: Go to Render
1. Open [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **New → Web Service**
4. Select your estiMate repo

### Step 1c: Configure Render
```
Name:                  estimate-api
Environment:           Node
Region:                (closest to you)
Branch:                main
Root Directory:        server                    ⚠️ IMPORTANT
Build Command:         npm run build --workspace=server
Start Command:         npm start --workspace=server
```

### Step 1d: Add Environment Variables
```
JWT_SECRET = <your-jwt-secret-here>
GITHUB_TOKEN = <your-github-personal-access-token>
NODE_ENV = production
CLIENT_URL = http://localhost:5173    ← Use this for now
```

**Note**: After you deploy Vercel, come back and update `CLIENT_URL` to your Vercel URL

⚠️ **IMPORTANT**: Generate your own JWT_SECRET and GitHub token. Never commit real secrets to git.

### Step 1e: Deploy
- Click **Create Web Service**
- Wait for ✅ "Your service is live"
- **Save this URL**: `https://estimate-api-XXXXX.onrender.com`

---

## Phase 2: Deploy Frontend to Vercel

### Step 2a: Go to Vercel
1. Open [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import Git Repository
4. Select estiMate repo

### Step 2b: Configure Vercel
```
Root Directory:        ./client                  ⚠️ IMPORTANT
Build Command:         npm run build --workspace=client
Output Directory:      dist
```

### Step 2c: Add Environment Variable
```
VITE_API_URL = https://estimate-api-XXXXX.onrender.com
                                        ↑ Use your Render URL
```

### Step 2d: Deploy
- Click **Deploy**
- Wait for ✅ deployment complete
- **Save this URL**: `https://estimate-XXXXX.vercel.app`

---

## Phase 3: Connect Them Together

### Step 3a: Update CORS in Backend

Edit `server/src/index.ts` at line ~22:

**Find:**
```typescript
const allowedOrigins = [
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
```

**Change to:**
```typescript
const allowedOrigins = [
    'https://estimate-XXXXX.vercel.app',  // ← ADD THIS
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
```
(Replace XXXXX with your actual Vercel subdomain)

### Step 3b: Push Changes
```bash
git add server/src/index.ts
git commit -m "Update CORS for Vercel domain"
git push origin main
```
Render auto-redeploys! ✅

---

## Phase 4: Test Everything

### Test 1: Open Frontend
```
URL: https://estimate-XXXXX.vercel.app
See: Login page loads ✅
```

### Test 2: Check Console
```
F12 → Console tab
No errors? ✅
```

### Test 3: Try Login
```
1. Enter test email: test@example.com
2. Enter password: anypassword
3. Click Submit
4. Check Network tab - should see request to:
   https://estimate-api-XXXXX.onrender.com/api/auth/login
5. See response (success or error is OK)
```

### Test 4: No CORS Errors?
```
If you see "CORS" error in console:
→ Backend CORS not updated correctly
→ Re-check step 3a
```

---

## 📊 Quick Reference

| What | Where | Value |
|------|-------|-------|
| Backend URL | Render Dashboard | `https://estimate-api-XXXXX.onrender.com` |
| Frontend URL | Vercel Dashboard | `https://estimate-XXXXX.vercel.app` |
| API Environment | Vercel Settings | `VITE_API_URL` = Backend URL |
| CORS Config | `server/src/index.ts` | allowedOrigins |

---

## ✅ Success Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Render URL in Vercel env variable
- [ ] Vercel URL in backend CORS
- [ ] Frontend loads (no blank page)
- [ ] Can see login form
- [ ] Console has no errors
- [ ] API calls go to correct URL
- [ ] No CORS errors in console

---

## 🆘 If Something Broken

### "Build failed"
- Check Render/Vercel build logs for error
- Make sure Root Directory is correct
- Make sure Build Command is correct

### "Cannot connect to API" or "404"
- Check `VITE_API_URL` in Vercel env vars
- Verify Render backend is running (Render dashboard)
- Check Vercel got the env var (might need redeploy)

### "CORS error"
- Go to `server/src/index.ts`
- Add your Vercel URL to `allowedOrigins`
- Commit and push
- Wait 2 min for Render to redeploy

### "Vercel URL works but API doesn't"
- Render might be sleeping (free tier)
- First request takes 30 sec to wake up
- Or upgrade to Starter Pro ($7/month)

---

## 🔄 How to Update Later

### To update frontend:
```bash
git add client/
git commit -m "Update frontend"
git push origin main
# Vercel auto-redeploys in 30 sec
```

### To update backend:
```bash
git add server/
git commit -m "Update backend"
git push origin main
# Render auto-redeploys in 1-2 min
```

### To change API URL:
1. Vercel Dashboard → Settings → Environment Variables
2. Update `VITE_API_URL`
3. Vercel auto-redeploys

---

## 💡 Pro Tips

1. **Bookmark these URLs**:
   - Render: https://dashboard.render.com
   - Vercel: https://vercel.com/dashboard

2. **Check logs when something breaks**:
   - Render: Dashboard → YourService → Logs
   - Vercel: Dashboard → YourProject → Deployments → View logs

3. **Free tier gotchas**:
   - Render sleeps after 15 min (slow first request)
   - Upgrade to Pro ($7/month) for always-on
   - Vercel free is always on

4. **Environment variable mistakes**:
   - Don't use quotes around values in UI
   - Case-sensitive!
   - Redeploy after changing

---

## 🎉 You're Live!

When all tests pass:
- ✅ Share your Vercel URL
- ✅ People can use your app
- ✅ API calls work
- ✅ Logins authentic
- ✅ All features running

**Celebrate! 🚀**

---

## 📚 More Info

- Detailed Render guide: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- Detailed Vercel guide: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- Full integration guide: [RENDER_VERCEL_SETUP.md](RENDER_VERCEL_SETUP.md)

---

**Created**: April 2026 | **For**: estiMate App
