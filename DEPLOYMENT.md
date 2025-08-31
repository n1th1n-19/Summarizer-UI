# Vercel Deployment Guide

## Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Backend API running at: https://summarizer-server-q12q.onrender.com

## Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://summarizer-server-q12q.onrender.com
   NEXT_PUBLIC_FRONTEND_URL=https://your-app-name.vercel.app
   ```

3. **Build Settings**
   Vercel will automatically detect this is a Next.js project and use:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Framework: Next.js

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a live URL like `https://your-app-name.vercel.app`

## Files Created for Deployment

- `vercel.json` - Vercel configuration
- `.env.example` - Environment variables template
- Updated `next.config.js` - Production optimizations
- Fixed Suspense boundary in auth callback

## Post-Deployment

1. Update `NEXT_PUBLIC_FRONTEND_URL` with your actual Vercel URL
2. Test Google OAuth flow works with production URL
3. Verify all API calls are working with the backend

## Build Warnings

The build shows some metadata warnings that don't affect functionality:
- Viewport and themeColor metadata should be moved to viewport export (Next.js 15+ requirement)
- Some React Hook dependency warnings for useEffect

These are non-blocking and the app will function correctly.