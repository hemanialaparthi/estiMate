# Vercel Deployment Guide - estiMate Client

Your estiMate frontend is now ready to deploy to Vercel! Follow these steps:

## 📋 Prerequisite Setup

### 1. Create a Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up or log in with GitHub
- Create a new team/organization if needed

### 2. Deploy Your Backend First (Important!)
Before deploying the client, you **must** have your backend API deployed somewhere, because:
- Your frontend will need a `VITE_API_URL` environment variable pointing to the backend
- Without the backend URL, API calls will fail in production

**Backend Deployment Options:**
- **Render**: Free tier available at [render.com](https://render.com)
- **Railway**: Free tier at [railway.app](https://railway.app)
- **AWS Lambda + API Gateway**: Serverless option
- **Heroku**: Paid tier (free tier deprecated)
- **DigitalOcean**: Starting at $5/month
- Your own server/VPS

### 3. Get Your Backend API URL
Once deployed, note the public API URL (e.g., `https://estimate-api.onrender.com`)

---

## 🚀 Deploy to Vercel

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

**Note**: If you haven't initialized git:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/estiMate.git
git push -u origin main
```

### Step 2: Import Project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your estiMate repository
4. Click Import

### Step 3: Configure Build Settings
In the "Import Project" dialog:

**Project Name**: `estimate-client` (or any name)

**Framework**: `Vite` (should auto-detect)

**Root Directory**: `./client` (IMPORTANT!)

**Build Command**: `npm run build`

**Output Directory**: `dist`

### Step 4: Set Environment Variables
Click "Environment Variables" and add:

```
Name: VITE_API_URL
Value: https://your-backend-api.com
```

Example values:
- Render: `https://estimate-api.onrender.com`
- Railway: `https://estimate-prod.up.railway.app`
- Local testing: `http://localhost:4000`

**⚠️ Important**: 
- The `VITE_` prefix is required for Vite to expose variables to the browser
- Never include trailing slashes in the URL
- The client will automatically append `/auth`, `/projects`, etc. to this URL

### Step 5: Deploy!
Click "Deploy" and wait for the build to complete.

---

## ✅ Verify Deployment

1. **Check Build Output**: Look for:
   ```
   ✓ built in 1.33s
   ```

2. **Test the App**:
   - Click the deployment URL
   - Try logging in with test credentials
   - Check browser console (F12) for any API errors

3. **Test API Calls**:
   - Network tab should show requests going to your backend URL
   - e.g., `https://your-backend-api.com/auth/login`

4. **Common Issues**:
   - "Failed to fetch": Backend URL is wrong or backend is down
   - "CORS error": Your backend needs CORS headers enabled
   - "Cannot POST /api/auth/login": The backend isn't recognizing requests

---

## 🔧 Environment Variables by Environment

### Development (Local)
```
# client/.env.local (git-ignored)
VITE_API_URL=http://localhost:4000
```

### Production (Vercel)
Set in Vercel dashboard:
```
VITE_API_URL=https://your-backend-api.com
```

### Staging (Optional)
Create a separate Vercel project:
```
VITE_API_URL=https://staging-api.onrender.com
```

---

## 📦 Project Configuration Files

### vercel.json
Already created with:
- Correct build command for monorepo
- Correct output directory
- Rewrites for React Router

### client/.env.production
Already created with placeholder:
```
VITE_API_URL=https://your-backend-api.com
```

---

## 🌐 Update Backend API URL

When you have a permanent backend URL, update it:

### Option 1: Update Environment Variable
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Update `VITE_API_URL` value
3. Redeploy (Vercel auto-deploys on push, or manually redeploy)

### Option 2: Update .env.production
```bash
VITE_API_URL=https://my-permanent-api.com
git add .
git commit -m "Update API URL to permanent backend"
git push
```

---

## 🔄 Redeployment & Updates

### Auto Redeployment
Any push to `main` branch automatically redeploys.

### Manual Redeploy
1. Vercel Dashboard → Select project
2. Click "Redeploy" button
3. Choose "Redeploy existing Build" or trigger new build

---

## 🛠️ Backend Configuration Checklist

Your backend MUST have:

- ✅ CORS headers enabled (allowing requests from your Vercel domain)
- ✅ Accept POST requests to `/auth/login` and `/auth/register`
- ✅ Accept GET requests to `/projects`, `/settings`, `/estimate/history`, `/insights`
- ✅ Accept POST requests to `/estimate`, `/projects/add-manual`, `/tasks/generate`, etc.
- ✅ Return proper JWT tokens in login response
- ✅ Validate Authorization Bearer tokens

### CORS Example (Express)
```javascript
import cors from 'cors';

app.use(cors({
    origin: ['https://your-vercel-domain.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
```

---

## 🚨 Troubleshooting

### Build Fails with "Cannot find module"
- Make sure `client/.env.production` exists
- Check Node version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`

### API Calls Returning 404
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend is running and responsive
- Verify backend endpoints are correct

### CORS Errors in Browser Console
- Your backend needs CORS headers
- Add your Vercel domain to backend's CORS allowed origins
- Contact backend team to enable CORS

### Blank Page or Loading Forever
- Check browser console (F12) for errors
- Verify JavaScript is enabled
- Check Vercel build logs for errors

### Environment Variable Not Applied
- Redeploy after updating environment variable
- Clear browser cache (Ctrl+Shift+Delete)
- Check variable name doesn't have typos

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Vercel Dashboard → Analytics tab
- View real-time traffic, performance metrics
- Monitor Core Web Vitals

### Error Tracking
- Vercel Dashboard → Edge Functions (if using)
- Check Function Logs for backend call errors

---

## 🔐 Security Best Practices

1. **Never commit .env files**:
   - Add to `.gitignore`:
     ```
     .env
     .env.local
     .env.*.local
     ```

2. **Use Vercel's Environment Variables** for sensitive data:
   - API URLs
   - Feature flags
   - Analytics keys

3. **Enable HTTPS**: Vercel auto-issues SSL certificates

4. **Protect Backend**: Require authentication tokens
   - Already implemented with JWT in estiMate

---

## ✨ Custom Domain (Optional)

1. Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., estimate.mycompany.com)
3. Follow DNS configuration instructions
4. SSL certificate auto-issued

---

## 📞 Getting Help

### Vercel Support
- [vercel.com/docs](https://vercel.com/docs)
- [Community forums](https://github.com/vercel/vercel/discussions)

### Common Vercel Commands (via CLI)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from local machine
vercel

# Deploy to production
vercel --prod

# View deployment
vercel open
```

---

**Your app is ready to go live! 🎉**

Once deployed, share the Vercel URL with your team and start using estiMate in production!
