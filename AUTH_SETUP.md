# Authentication Setup Guide

This guide explains how to set up authentication for the POS Web App.

## Overview

The app now includes:
- **Sign Up** - Create new user accounts
- **Sign In** - Authenticate existing users
- **User-specific data** - Each user only sees their own categories, items, and transactions
- **Row Level Security (RLS)** - Database-level security ensuring data isolation

## Database Schema Changes

### New Structure

All tables now include a `user_id` column that links data to specific users:
- `categories.user_id` - Links categories to users
- `items.user_id` - Links items to users
- `transactions.user_id` - Links transactions to users

### Row Level Security (RLS)

RLS policies ensure users can only:
- **View** their own data
- **Create** data linked to their user ID
- **Update** their own data
- **Delete** their own data

## Setup Instructions

### Step 1: Enable Supabase Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider (should be enabled by default)
4. Configure email settings if needed

### Step 2: Run Database Schema

**For New Databases:**
- Run the entire `supabase-schema.sql` file in Supabase SQL Editor
- This creates all tables with user_id columns and RLS policies

**For Existing Databases:**
- Run `supabase-migration.sql` in Supabase SQL Editor
- **Important:** You'll need to handle existing data:
  - Option A: Delete existing data (recommended for fresh start)
  - Option B: Assign existing data to a specific user

### Step 3: Verify RLS Policies

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Verify policies exist for:
   - `categories` table
   - `items` table
   - `transactions` table
3. Each table should have 4 policies: SELECT, INSERT, UPDATE, DELETE

## How It Works

### Sign Up Flow

1. User enters name, email, and password
2. Account is created in Supabase Auth
3. User is automatically signed in
4. All subsequent data operations include their `user_id`

### Sign In Flow

1. User enters email and password
2. Supabase authenticates the user
3. Session is stored (persists across page refreshes)
4. User can access their data

### Data Isolation

- When a user creates a category/item/transaction, `user_id` is automatically added
- RLS policies filter queries to only return the user's data
- Users cannot see or modify other users' data

## Testing

1. **Create Account:**
   - Click "Sign Up"
   - Enter name, email, password
   - Account is created and you're signed in

2. **Sign Out:**
   - Click "Sign Out" in the navbar
   - You'll be redirected to sign in page

3. **Sign In:**
   - Enter your email and password
   - You'll see only your data

4. **Test Data Isolation:**
   - Create a category/item as one user
   - Sign out and create another account
   - Sign in with the new account
   - You should see empty data (no data from first user)

## Troubleshooting

### "Email address is invalid" Error

If you get an error like "Email address 'test@gmail.com' is invalid":

1. **Check Supabase Email Settings:**
   - Go to Supabase Dashboard → **Authentication** → **Settings**
   - Check **"Email Auth"** section
   - Look for **"Email Domain Restrictions"** or **"Allowed Email Domains"**
   - If there are restrictions, either:
     - Add your email domain to the allowed list, OR
     - Remove the restrictions (for development/testing)

2. **Check Email Validation:**
   - Go to **Authentication** → **Providers** → **Email**
   - Verify email provider is enabled
   - Check if there are any custom validation rules

3. **For Development/Testing:**
   - You can disable email domain restrictions temporarily
   - Or use an email from an allowed domain
   - Check Supabase logs for more details

4. **Common Issues:**
   - Email contains spaces (should be trimmed automatically)
   - Email domain is blocked by Supabase project settings
   - Email format doesn't match Supabase's validation rules

### "User not authenticated" Error

- Make sure you're signed in
- Check browser console for auth errors
- Verify Supabase credentials in `.env`

### "new row violates row-level security policy" Error

- Check that RLS policies are created correctly
- Verify user is authenticated (check `auth.uid()`)
- Ensure `user_id` is being set correctly

### Existing Data Issues

If you have existing data without `user_id`:
1. Option A: Delete it (run `DELETE FROM table_name WHERE user_id IS NULL;`)
2. Option B: Assign to a user (get user ID from auth.users table, then update)

## Security Notes

- Passwords are hashed by Supabase (never stored in plain text)
- Sessions are managed securely by Supabase
- RLS policies provide database-level security
- Each user's data is completely isolated

## Next Steps

After setting up authentication:
1. Create your first account
2. Start adding categories and items
3. Make sales transactions
4. All data will be automatically linked to your user account

