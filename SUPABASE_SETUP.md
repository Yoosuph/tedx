# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in:
   - **Name**: `tedx-dutse` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users (e.g., `West US` or `West EU`)
   - **Pricing Plan**: Free tier is sufficient
5. Wait for initialization (~2 minutes)

## Step 2: Get Your Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
3. Update your `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" message

## Step 4: Seed Initial Data

Run this command to populate the database with your current site data:

```bash
npm run seed-supabase
```

This will:
- Create site configuration
- Add all speakers
- Add schedule items
- Add ticket tiers
- Add gallery images
- Add sponsors

## Step 5: Enable Admin Operations (Optional)

If you want the admin panel to write to Supabase instead of localStorage:

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy the **service_role** key (the secret one, NOT the anon key)
3. Add it to your `.env`:
```bash
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **WARNING**: Never commit the service_role key to git. It bypasses all security policies.

## Step 6: Test the Integration

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Open browser console and check for Supabase connection
4. Navigate to admin panel and test CRUD operations

## Troubleshooting

### "Supabase credentials not found" error
- Make sure `.env` file exists in project root
- Restart dev server after updating `.env`
- Check that variable names start with `VITE_`

### "Permission denied" errors on writes
- This is expected with Row Level Security (RLS) enabled
- The anon key only allows reads (public data)
- For admin writes, you need the service_role key or proper RLS policies

### Data not syncing
- Check browser console for API errors
- Verify your Supabase URL and key are correct
- Try clearing localStorage and refreshing (app will fall back to Supabase)

## Next Steps

Once Supabase is working:
1. Test all CRUD operations in admin panel
2. Verify data persists across sessions
3. Test on multiple devices
4. Set up Supabase authentication for admin users (Phase 2)
