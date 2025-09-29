# Live Polling System - Deployment Guide

## Issues Fixed

### 1. **Hardcoded URLs**
- ✅ Updated `src/services/apiService.js` to use environment variables
- ✅ Updated `src/services/socketService.js` to use environment variables
- ✅ Created environment configuration files

### 2. **Vercel Configuration**
- ✅ Created `vercel.json` for proper routing
- ✅ Created `api/index.js` for serverless functions
- ✅ Updated CORS settings for Vercel domains

## Deployment Options

### Option 1: Single Vercel Deployment (Recommended)

**Pros:**
- Single deployment
- Cost-effective
- Easy to manage

**Cons:**
- Socket.io may have limitations in serverless environment
- Real-time features might be limited

**Steps:**
1. Deploy the entire project to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL` = `/api`
   - `VITE_SOCKET_URL` = `/`
   - `VITE_APP_ENV` = `production`

### Option 2: Separate Deployments (Better for Real-time)

**Frontend (Vercel):**
1. Deploy only the frontend files (everything except `backend/` folder)
2. Set environment variables:
   - `VITE_API_BASE_URL` = `https://your-backend-url.vercel.app/api`
   - `VITE_SOCKET_URL` = `https://your-backend-url.vercel.app`
   - `VITE_APP_ENV` = `production`

**Backend (Railway/Render/Heroku):**
1. Deploy the `backend/` folder separately
2. Use a platform that supports persistent WebSocket connections
3. Update CORS settings with your frontend URL

## Environment Variables

### Development
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_ENV=development
```

### Production (Single Vercel)
```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=/
VITE_APP_ENV=production
```

### Production (Separate Deployments)
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_SOCKET_URL=https://your-backend-url.vercel.app
VITE_APP_ENV=production
```

## Quick Fix for Current Deployment

1. **Update your Vercel environment variables:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add:
     - `VITE_API_BASE_URL` = `/api`
     - `VITE_SOCKET_URL` = `/`
     - `VITE_APP_ENV` = `production`

2. **Redeploy your project**

3. **For better real-time performance, consider:**
   - Deploying backend to Railway or Render
   - Using the separate deployment option

## Testing

After deployment, test:
1. Frontend loads correctly
2. API endpoints respond (check `/api/health`)
3. Socket connections work
4. Poll creation and participation work
5. Real-time updates function properly

## Troubleshooting

### Common Issues:
1. **CORS errors**: Update CORS origins in backend
2. **Socket connection fails**: Check if platform supports WebSockets
3. **API calls fail**: Verify environment variables are set correctly
4. **Build fails**: Check if all dependencies are in package.json

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables in Vercel dashboard
3. Test API endpoints directly
4. Check Vercel function logs
