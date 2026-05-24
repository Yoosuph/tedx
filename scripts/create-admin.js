/**
 * Creates the TEDxDutse admin user in Supabase Auth + user_roles table.
 *
 * Usage:
 *   node scripts/create-admin.js
 *
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root
config({ path: resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ADMIN_EMAIL = 'tedx@dutse.com';
const ADMIN_PASSWORD = 'tedx-dutse@123';

async function main() {
  console.log('Creating admin user...');

  // 1. Create the user in Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Automatically confirms email so they can sign in immediately
  });

  if (userError) {
    // PGRST116 = no rows returned, which happens on conflict
    if (userError.message?.includes('already exists')) {
      console.log('User already exists in Auth — skipping creation.');
    } else {
      console.error('Error creating user:', userError.message);
      process.exit(1);
    }
  } else {
    console.log(`✓ User created in Auth: ${userData.user.id}`);
  }

  // 2. Insert/upsert into user_roles
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .upsert(
      { email: ADMIN_EMAIL, role: 'admin' },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (roleError) {
    console.error('Error inserting into user_roles:', roleError.message);
    process.exit(1);
  }

  console.log(`✓ Admin role set: ${roleData.email} → ${roleData.role}`);
  console.log('\nYou can now sign in at /admin/login with:');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
