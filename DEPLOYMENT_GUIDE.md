# 🚀 Live Polling System - Deployment Guide

## ✅ Fixed File Structure

The project is now properly organized:

```
live_polling_system/
├── backend/                    # Backend deployment (separate Vercel project)
│   ├── api/
│   │   ├── index.js           # Serverless API functions
│   │   └── package.json       # API dependencies
│   ├── vercel.json            # Backend Vercel config
│   ├── package.json           # Backend dependencies
│   └── server.js              # Original server (for local dev)
├── src/                       # Frontend source code
├── vercel.json                # Frontend Vercel config
└── package.json               # Frontend dependencies
```

## 🎯 Deployment Steps

### Step 1: Deploy Backend (https://live-polling-backend-zeta.vercel.app/)

1. **Go to Vercel Dashboard**
2. **Create New Project** (or update existing backend project)
3. **Connect to your repository**
4. **Set Root Directory**: `backend`
5. **Deploy**

**Backend Environment Variables** (if needed):
```
NODE_ENV=production
```

### Step 2: Deploy Frontend (https://live-polling-gules.vercel.app/)

1. **Go to Vercel Dashboard**
2. **Create New Project** (or update existing frontend project)
3. **Connect to your repository**
4. **Set Root Directory**: `/` (root)
5. **Set Environment Variables**:
   ```
   VITE_API_BASE_URL=https://live-polling-backend-zeta.vercel.app/api
   VITE_SOCKET_URL=https://live-polling-backend-zeta.vercel.app
   VITE_APP_ENV=production
   ```
6. **Deploy**

## 🔧 Configuration Details

### Backend Configuration (`backend/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### Frontend Configuration (`vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🧪 Testing Your Deployment

### Test Backend API:
```bash
# Health check
curl https://live-polling-backend-zeta.vercel.app/api/health

# Expected response:
{"status":"OK","timestamp":"2024-01-XX..."}
```

### Test Frontend:
1. Visit: https://live-polling-gules.vercel.app/
2. Check browser console for errors
3. Try creating a poll
4. Test poll participation

## ⚠️ Important Notes

### Real-time Features:
- **Socket.io is disabled** in production (serverless limitation)
- **Polling works** but without live updates
- **All API endpoints work** for basic functionality

### For Full Real-time Support:
Deploy backend to platforms that support persistent connections:
- **Railway** (recommended)
- **Render**
- **Heroku**

Then update frontend environment variables to point to the new backend URL.

## 🐛 Troubleshooting

### Common Issues:

1. **404 Errors on API calls**:
   - Check if backend is deployed correctly
   - Verify environment variables in frontend
   - Check CORS settings

2. **Frontend not loading**:
   - Check if build completed successfully
   - Verify environment variables are set
   - Check Vercel function logs

3. **CORS Errors**:
   - Backend CORS is configured for your frontend URL
   - If using custom domain, update CORS origins

### Debug Steps:
1. Check Vercel function logs
2. Test API endpoints directly
3. Verify environment variables
4. Check browser console for errors

## 📁 File Structure Summary

- **Backend**: Deploy `backend/` folder as separate Vercel project
- **Frontend**: Deploy root folder as separate Vercel project
- **API**: Located in `backend/api/` for serverless functions
- **Configuration**: Each has its own `vercel.json`

## 🎉 Success Indicators

✅ Backend API responds to health check
✅ Frontend loads without 404 errors
✅ Poll creation works
✅ Poll participation works
✅ Results display correctly

Your deployment should now work perfectly! 🚀
