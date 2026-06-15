# Service Connections Setup - Complete Guide

## 📊 What Was Created

I've set up a **Service Connections Hub** in the supportdomain admin panel that shows the status of all external services and provides setup guidance.

---

## 🔌 Accessing the Connections Hub

### In Admin Panel:
1. Go to **supportdomain** (http://localhost:4000)
2. Navigate to **Core Engine** → **Service Connections**
3. You'll see all services with their current connection status

---

## 📍 Connection Status Overview

### ✅ CONNECTED Services
- **Supabase API**: Ready to use
  - URL: `https://sibaltmusbhcbelgtnli.supabase.co`
  - Status: Testing automatically when you visit the page

### ⚠️ DISCONNECTED / NEEDS SETUP

#### 1️⃣ **Supabase Database** (CRITICAL for page CMS)
**Current Status**: Disconnected
**Why**: `DATABASE_URL` env variable not configured

**What You Need**:
```
postgresql://postgres:TQ4QGLidbbrMoXsb@db.sibaltmusbhcbelgtnli.supabase.co:5432/postgres
```

**Setup Steps**:
1. Open `.env.local` in both root and supportdomain folders
2. Find: `DATABASE_URL=`
3. Add the connection string (already provided in your message)
4. Restart the dev server
5. Go back to Connections Hub → Click "Test Connection"

**Network Tips**:
- ⚠️ Note: Not IPv4 compatible
- ✅ Solution: Use Session Pooler for IPv4 networks (available in Supabase settings)
- 🔒 Keep credentials secure in `.env.local` (never commit to git)

#### 2️⃣ **Cloudinary** (For image uploads)
**Current Status**: Disconnected (Optional)
**Why**: API credentials not configured

**Setup Steps**:
1. Create account at https://cloudinary.com
2. Get your credentials from dashboard
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_URL=cloudinary://api_key:secret@cloud_name
   NEXT_PUBLIC_CLOUDINARY_GALLERY_URL=https://console.cloudinary.com/...
   ```
4. Restart server
5. Test connection from hub

#### 3️⃣ **Firebase** (Legacy - Being Replaced)
**Current Status**: Warning (Deprecated)
**Why**: Supabase now handles auth and data

**Action**: No action needed - can keep old Firebase config for backwards compatibility

---

## 🚀 Quick Connection Flow

```
.env.local configured
        ↓
Server restarted
        ↓
Visit /supportdomain/connections
        ↓
Click "Test Connection" buttons
        ↓
Services show ✅ CONNECTED or ⚠️ DISCONNECTED
        ↓
Follow in-page tips for any disconnected services
```

---

## 🔧 Features in Connections Hub

✅ **Real-time Status**: See which services are connected
✅ **Configuration Display**: Shows active config details
✅ **Environment Variables**: Lists what's needed
✅ **Setup Tips**: Specific guidance for each service
✅ **One-Click Testing**: Test any connection
✅ **Auto-Detection**: Checks all services on page load
✅ **Copy Buttons**: Quickly copy env var names

---

## 📁 Files Created/Modified

```
/src/lib/supabase.ts                          ← Updated with better error handling
/supportdomain/src/lib/supabase.ts           ← Updated with better error handling
/supportdomain/src/app/connections/page.tsx  ← Main connections status page
/supportdomain/src/app/api/connections/test/route.ts ← Connection testing API
/supportdomain/src/components/admin/sidebar.tsx     ← Added Connections link
.env.local (root)                             ← Supabase credentials
.env.local (supportdomain)                    ← Supabase credentials
.env.example (root & supportdomain)           ← Template with all vars explained
```

---

## 🎯 Next Steps

1. **Update Supabase Anon Key**:
   - Go to https://app.supabase.com → Your Project → Settings → API Keys
   - Copy the "anon" key
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

2. **Test the Connection**:
   ```bash
   npm run dev
   # Visit http://localhost:4000/connections
   ```

3. **For Database Operations**:
   - Add `DATABASE_URL` to `.env.local` (already filled in with your connection string)
   - This enables server-side database queries

4. **For Image Uploads**:
   - Set up Cloudinary (optional but recommended)
   - Assets page won't work without it

---

## 🆘 Troubleshooting

**Build Failed with "Missing Supabase environment variables"**
→ Solution: Ensure `.env.local` exists in project root with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Connections page shows "Disconnected"**
→ Check console for specific error
→ Verify credentials in `.env.local`
→ Restart dev server after changing env vars

**Database connection fails**
→ Test locally: `psql postgresql://user:pass@host:5432/postgres`
→ Check if Session Pooler is enabled for IPv4

---

## 📞 Connection Status Dashboard

Access the full status dashboard at:
- **Main Site**: Not available (no admin UI on main site)
- **Supportdomain**: http://localhost:4000/connections
- Shows: Real-time status, configuration, tips, test buttons

---

## ✨ What's Connected Now

After setup:
- ✅ Supabase API (auth, realtime)
- ✅ Supabase Database (pages CMS, profiles, data)
- ✅ Cloudinary (image uploads)
- ⚠️ Firebase (legacy, optional)

All services can be tested and managed from the Connections Hub!
