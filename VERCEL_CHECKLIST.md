# ✅ Vercel Deployment Checklist

Use this checklist to ensure everything is ready before deploying to Vercel.

## 📋 Pre-Deployment Checklist

### Backend Setup
- [ ] **Deploy backend API** to Render, Railway, AWS, or similar
  - Recommended: [Render.com](https://render.com) (free tier available)
  - Alternative: [Railway.app](https://railway.app)
- [ ] **Get backend URL** (e.g., `https://estimate-api.onrender.com`)
- [ ] **Test backend locally** - verify all endpoints work
- [ ] **Enable CORS** in backend to accept requests from Vercel domain
- [ ] **Test authentication** - login endpoint works

### Frontend Configuration
- [ ] **Build locally succeeds**
  ```bash
  cd client && npm run build
  ```
- [ ] **`vercel.json` exists** in root
- [ ] **`client/.env.production` exists** 
- [ ] **`client/src/utils/api.ts` exists** with apiClient
- [ ] **All pages use `apiClient`** (not `axios`)
- [ ] **No hardcoded API URLs** in code

### Git Setup
- [ ] **GitHub account created**
- [ ] **Project pushed to GitHub**
  ```bash
  git add .
  git commit -m "Vercel deployment ready"
  git push origin main
  ```
- [ ] **No .env files committed** (should be in .gitignore)

---

## 🚀 Deployment Steps

### 1. Connect to Vercel
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Select "Import Git Repository"
- [ ] Select your estiMate GitHub repo
- [ ] Click "Import"

### 2. Configure Project Settings
- [ ] **Project Name**: `estimate-client` (or preferred name)
- [ ] **Framework**: `Vite` (should auto-detect)
- [ ] **Root Directory**: `./client` ⚠️ **IMPORTANT!**
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`

### 3. Set Environment Variables
- [ ] Click "Environment Variables"
- [ ] Add:
  ```
  Name: VITE_API_URL
  Value: https://your-backend-api.com
  ```
  (Replace with your actual backend URL)
- [ ] Click "Add"

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check for green checkmark ✅

---

## ✅ Post-Deployment Testing

### Application Tests
- [ ] [ ] Access the Vercel URL (shown after deployment)
- [ ] [ ] App loads without errors
- [ ] [ ] Dark theme displays correctly
- [ ] [ ] Navigation works

### Authentication Tests
- [ ] [ ] Login page appears
- [ ] [ ] Can enter email/password
- [ ] [ ] Submit button works
- [ ] [ ] See success/error toast notifications
- [ ] [ ] Successful login redirects to dashboard

### API Integration Tests
- [ ] [ ] Open browser DevTools (F12)
- [ ] [ ] Go to Network tab
- [ ] [ ] Attempt login
- [ ] [ ] Check that requests go to your backend URL
  - Should see: `https://your-backend-api.com/auth/login`
  - NOT: `/api/auth/login` (relative path)
- [ ] [ ] Verify response code is 200-201 (not 404)

### Feature Tests
- [ ] [ ] Can view dashboard (if authenticated)
- [ ] [ ] Can navigate between pages
- [ ] [ ] Form validation works
- [ ] [ ] Toast notifications appear
- [ ] [ ] No CORS errors in console

---

## 🆘 If Something Goes Wrong

### Build Failed
- [ ] Check Vercel build logs for error messages
- [ ] Verify `Root Directory` is set to `./client`
- [ ] Ensure `client/.env.production` exists
- [ ] Check Node version compatibility

### API Calls Failing (404 errors)
- [ ] Verify backend is running and accessible
- [ ] Check `VITE_API_URL` in Vercel env variables is correct
- [ ] Verify backend has these routes:
  - [ ] POST `/auth/login`
  - [ ] POST `/auth/register`
  - [ ] GET `/projects`
  - [ ] GET `/settings`
  - [ ] POST `/estimate`

### CORS Errors in Browser Console
- [ ] This is a backend issue, not frontend
- [ ] Backend needs CORS headers enabled
- [ ] Backend should allow your Vercel domain
- [ ] Example CORS header:
  ```
  Access-Control-Allow-Origin: https://your-app.vercel.app
  ```

### Environment Variable Not Working
- [ ] Double-check variable name: `VITE_API_URL` (exact spelling)
- [ ] Make sure it's NOT inside quotes in Vercel UI
- [ ] Redeploy after changing env vars
- [ ] Clear browser cache (Ctrl+Shift+Delete)

### Still Not Working?
- [ ] Review VERCEL_DEPLOYMENT.md for detailed troubleshooting
- [ ] Check Vercel build logs for specific errors
- [ ] Verify backend is responding to requests
- [ ] Test backend directly with curl/Postman

---

## 📊 Expected Performance

After deployment, you should see:
- ✅ Page loads in <3 seconds
- ✅ Login works with real backend
- ✅ Dashboard loads with data
- ✅ No console errors
- ✅ Responsive on mobile
- ✅ Toast notifications work

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/account/projects
- **Build Logs**: Your project → Deployments → View build logs
- **Domain Settings**: Your project → Settings → Domains

---

## 💡 Pro Tips

1. **Continuous Deployment**: Any push to `main` branch auto-deploys
2. **Revert Deployment**: Go to Deployments tab and click an older build
3. **Custom Domain**: Project Settings → Domains (free SSL included)
4. **Analytics**: View traffic and performance in Analytics tab
5. **Preview URLs**: Each PR gets a preview deployment

---

**Ready to deploy? Check off the boxes and follow the steps!** 🚀

After deployment, your estiMate app will be live and accessible to your team!
