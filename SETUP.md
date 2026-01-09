# Setup Guide for POS Web App with Supabase

This guide will help you set up the POS Web App with Supabase database for deployment on Vercel.

## Quick Reference: Where to Find Supabase Keys

**Location:** Supabase Dashboard → Settings (⚙️) → API

| What You Need | Where to Find It | What It's Called in Supabase |
|---------------|------------------|------------------------------|
| `VITE_SUPABASE_URL` | "Project URL" section | Project URL |
| `VITE_SUPABASE_ANON_KEY` | "Project API keys" → "anon/public" | anon public key |
| `SUPABASE_URL` | Same as above (Project URL) | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | "Project API keys" → "service_role/secret" | service_role secret key |

**Direct Link:** After logging into Supabase, go to: `https://app.supabase.com/project/_/settings/api`

## Prerequisites

1. A Supabase account (free tier available at https://supabase.com)
2. A Vercel account (free tier available at https://vercel.com)
3. Node.js installed locally for development

## Step 1: Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in your project details and wait for the database to be created

2. **Run the Database Schema**
   - In your Supabase dashboard, go to "SQL Editor"
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to execute the SQL script
   - This will create the `categories`, `items`, and `transactions` tables

3. **Get Your Supabase Credentials**
   
   Follow these steps to find your Supabase URL and API keys:
   
   **Step 3a: Navigate to API Settings**
   - In your Supabase dashboard, click on the **Settings** icon (gear icon) in the left sidebar
   - Click on **API** from the settings menu
   
   **Step 3b: Find Your Credentials**
   
   You'll see a page with several sections. Here's what to copy:
   
   **1. Project URL (SUPABASE_URL / VITE_SUPABASE_URL)**
   - Look for the section labeled **"Project URL"** or **"Config"**
   - It will look like: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy this entire URL
   - This is used for both `SUPABASE_URL` and `VITE_SUPABASE_URL`
   
   **2. Anon/Public Key (VITE_SUPABASE_ANON_KEY)**
   - Look for the section labeled **"Project API keys"**
   - Find the key labeled **"anon"** or **"public"**
   - Click the **"Reveal"** or **"Show"** button to see the full key
   - Copy the entire key (it's a long string starting with `eyJ...`)
   - This is your `VITE_SUPABASE_ANON_KEY`
   
   **3. Service Role Key (SUPABASE_SERVICE_ROLE_KEY)**
   - In the same **"Project API keys"** section
   - Find the key labeled **"service_role"** or **"secret"**
   - Click the **"Reveal"** or **"Show"** button to see the full key
   - Copy the entire key (it's a long string starting with `eyJ...`)
   - ⚠️ **IMPORTANT**: This key has admin privileges - keep it secret! Never commit it to Git.
   - This is your `SUPABASE_SERVICE_ROLE_KEY`
   
   **Visual Guide:**
   ```
   Supabase Dashboard → Settings (⚙️) → API
   
   You'll see:
   ┌─────────────────────────────────────┐
   │ Project URL                          │
   │ https://xxxxx.supabase.co            │ ← Copy this
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ Project API keys                     │
   │                                      │
   │ anon / public                        │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6...     │ ← Copy this (VITE_SUPABASE_ANON_KEY)
   │ [Reveal] [Copy]                      │
   │                                      │
   │ service_role / secret                │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6...     │ ← Copy this (SUPABASE_SERVICE_ROLE_KEY)
   │ [Reveal] [Copy]                      │
   └─────────────────────────────────────┘
   ```

## Step 2: Configure Environment Variables

### For Local Development

1. Create a `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE=/api
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

**For Client-side (Build-time):**
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
- `VITE_API_BASE` = `/api`

**For Server-side (Runtime):**
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (keep secret!)

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Local Development

```bash
npm run dev
```

The app will run at `http://localhost:3000`

**Note:** For local development, the app will fall back to localStorage if Supabase credentials are not configured. This allows you to develop without a database, but data won't persist.

## Step 5: Deploy to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Vite project

3. **Add Environment Variables**
   - In the Vercel project settings, add all the environment variables mentioned in Step 2

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live!

## Troubleshooting

### Categories/Items Not Saving

1. **Check Environment Variables**
   - Ensure all Supabase environment variables are set correctly in Vercel
   - Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (not just the anon key)

2. **Check Database Tables**
   - Verify that the tables were created in Supabase
   - Go to Supabase Dashboard → Table Editor to see if tables exist

3. **Check API Routes**
   - Check Vercel function logs for errors
   - Go to Vercel Dashboard → Your Project → Functions to see logs

4. **Check CORS**
   - The API routes include CORS headers, but if you're still having issues, check browser console for CORS errors

### Database Connection Issues

1. **Verify Supabase URL and Keys**
   - Make sure there are no extra spaces in environment variables
   - The URL should start with `https://`

2. **Check Row Level Security (RLS)**
   - The schema includes policies that allow all operations
   - If you've modified RLS policies, ensure they allow the operations you need

## Database Schema

The app uses three main tables:

- **categories**: Stores product categories
- **items**: Stores products/items
- **transactions**: Stores sales transactions

See `supabase-schema.sql` for the complete schema definition.

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - keep it secret!
- For production, consider implementing proper authentication
- The current setup allows all operations - you may want to restrict this based on your needs

## Support

If you encounter issues:
1. Check the browser console for client-side errors
2. Check Vercel function logs for server-side errors
3. Check Supabase logs in the dashboard
4. Verify all environment variables are set correctly

