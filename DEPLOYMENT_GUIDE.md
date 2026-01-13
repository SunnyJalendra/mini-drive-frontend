# 🚀 Mini Drive Deployment Guide (Vercel + Render)

## 📋 Pre-Deployment Checklist

### Backend (mini-drive-backend)
- [ ] `.env` file configured with production MongoDB URL
- [ ] All dependencies installed (`npm install`)
- [ ] `server.js` working locally on port 5000
- [ ] GitHub repository created and pushed
- [ ] MongoDB Atlas cluster created (free tier)

### Frontend (mini-drive-frontend)
- [ ] All tests passing locally
- [ ] No console errors
- [ ] `.env.local` or environment variables configured
- [ ] GitHub repository created and pushed
- [ ] Build tested: `npm run build`

---

## 🔧 Step 1: Backend Deployment (Render)

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easier deployment)
3. Verify email

### 1.2 Create MongoDB Atlas Database
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/mini-drive`
5. Save for later use in `.env`

### 1.3 Prepare Backend for Deployment

**File: mini-drive-backend/.env (Update with production values)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-drive
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=production
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Important:** Update these values with your actual credentials!

### 1.4 Ensure Backend is Ready
- Run `npm install` to verify all dependencies
- Test locally: `npm start` or `node server.js`
- Ensure `server.js` listens on `process.env.PORT || 5000`

### 1.5 Push Backend to GitHub
```bash
cd C:\Users\SUNNY\OneDrive\Desktop\mini-drive-backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/mini-drive-backend.git
git branch -M main
git push -u origin main
```

### 1.6 Deploy on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository (mini-drive-backend)
4. Fill in details:
   - **Name:** mini-drive-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Click "Advanced" and add environment variables from `.env`
6. Create Web Service
7. Wait for deployment (5-10 minutes)
8. Copy the deployed URL: `https://mini-drive-backend.onrender.com`

**Save this URL!** You'll need it for the frontend.

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Verify email

### 2.2 Create `.env.production` File

**File: mini-drive-frontend/.env.production**
```
REACT_APP_API_URL=https://mini-drive-backend.onrender.com
```

(Replace with your actual Render backend URL)

### 2.3 Update Frontend Config

**File: mini-drive-frontend/package.json**
Make sure your scripts are correct:
```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
}
```

### 2.4 Test Build Locally
```bash
cd C:\Users\SUNNY\OneDrive\Desktop\mini-drive-frontend
npm run build
```

Verify `build/` folder is created and contains `index.html`

### 2.5 Push Frontend to GitHub
```bash
cd C:\Users\SUNNY\OneDrive\Desktop\mini-drive-frontend
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/YOUR_USERNAME/mini-drive-frontend.git
git branch -M main
git push -u origin main
```

### 2.6 Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import Git Repository (mini-drive-frontend)
4. Configure project:
   - **Framework Preset:** Create React App
   - **Root Directory:** ./ (or ./mini-drive-frontend if mono-repo)
5. Add Environment Variables:
   - Key: `REACT_APP_API_URL`
   - Value: `https://mini-drive-backend.onrender.com`
6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Get frontend URL: `https://your-app.vercel.app`

---

## ✅ Step 3: Testing Live Deployment

### 3.1 Test Frontend Access
1. Open https://your-app.vercel.app in browser
2. Verify login page loads
3. Check browser console for errors

### 3.2 Test API Connection
1. Try signing up with test@example.com
2. Check console network tab for API requests
3. Verify requests go to `https://mini-drive-backend.onrender.com`

### 3.3 Test All Features
- [ ] Signup and login
- [ ] Upload file
- [ ] Download file
- [ ] Delete file
- [ ] Share file and request access
- [ ] Admin dashboard (if applicable)

### 3.4 Troubleshooting

**If API calls fail:**
1. Check Render backend is running: Open https://mini-drive-backend.onrender.com
2. Check CORS is enabled in backend (should be by default)
3. Verify environment variables match on Render dashboard

**If frontend doesn't load:**
1. Check Vercel deployment logs
2. Verify build succeeded
3. Check environment variables are set

**If you get 404 errors:**
1. Make sure React Router is configured correctly
2. Check `vercel.json` if needed (SPA routing)

---

## 📝 vercel.json (Add to Frontend Root)

Create `mini-drive-frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_API_URL": "@react_app_api_url"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures SPA routing works correctly (all routes go to index.html).

---

## 🔐 Environment Variables Summary

### Backend (Render)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://mini-drive-backend.onrender.com
```

---

## 📊 Deployment Checklist

### Backend
- [ ] MongoDB Atlas account created
- [ ] `.env` file updated with production values
- [ ] Code pushed to GitHub
- [ ] Render web service created
- [ ] Environment variables configured on Render
- [ ] Deployment successful
- [ ] Backend URL copied

### Frontend
- [ ] `vercel.json` created
- [ ] `.env.production` created with API URL
- [ ] `npm run build` succeeds locally
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Deployment successful

### Testing
- [ ] Frontend loads at Vercel URL
- [ ] API requests go to Render URL
- [ ] All features work (signup, upload, share, etc.)
- [ ] No console errors
- [ ] Performance acceptable

---

## 🎯 Live URLs (After Deployment)

**Frontend:** https://your-frontend.vercel.app  
**Backend API:** https://your-backend.onrender.com  
**Share Link Example:** https://your-frontend.vercel.app/share/file-id

---

## 📞 Support & Troubleshooting

### Common Issues

1. **CORS errors:** Add frontend URL to backend CORS config
2. **MongoDB connection fails:** Check MongoDB Atlas IP whitelist (allow all for free tier)
3. **Environment variables not working:** Redeploy after setting them
4. **Build fails:** Run `npm run build` locally to debug

### Helpful Resources
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [React Deployment](https://create-react-app.dev/deployment/)

---

**Ready to deploy? Follow the steps above!** 🚀
