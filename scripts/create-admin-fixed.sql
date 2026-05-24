-- ==============================================================
-- TEDxDutse - Create Admin User in Supabase
-- ==============================================================
-- Copy & paste this entire file into Supabase Dashboard
-- → SQL Editor → New query → Run
-- ==============================================================

-- 1. Create user in auth.users (or update existing one)
DO $$
DECLARE
  _user_id uuid;
  _encrypted_pw text;
BEGIN
  -- Check if user already exists
  SELECT id INTO _user_id FROM auth.users WHERE email = 'tedx@dutse.com';
  
  IF _user_id IS NULL THEN
    -- Generate bcrypt hash of the password
    _encrypted_pw := crypt('tedx-dutse@123', gen_salt('bf'));
    
    -- Create new user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at,
      confirmation_token, recovery_token,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'tedx@dutse.com',
      _encrypted_pw,
      NOW(), -- email_confirmed_at → allows login
      NOW(),
      '', '',
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(), NOW(), FALSE
    )
    RETURNING id INTO _user_id;
    
    RAISE NOTICE 'Created new user with id: %', _user_id;
  ELSE
    -- User exists but email might not be confirmed — fix that
    UPDATE auth.users
    SET 
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW(),
      encrypted_password = crypt('tedx-dutse@123', gen_salt('bf')),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}',
      confirmation_sent_at = COALESCE(confirmation_sent_at, NOW()),
      is_sso_user = FALSE
    WHERE id = _user_id;
    
    RAISE NOTICE 'Updated existing user with id: %', _user_id;
  END IF;

  -- 2. Create identity for the user (required for email/password login)
  IF NOT EXISTS (
    SELECT 1 FROM auth.identities 
    WHERE user_id = _user_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, 
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      _user_id,
      json_build_object('sub', _user_id::text, 'email', 'tedx@dutse.com'),
      'email',
      NOW(), NOW(), NOW()
    );
    RAISE NOTICE 'Created email identity for user';
  ELSE
    RAISE NOTICE 'Email identity already exists';
  END IF;
END $$;

-- 3. Insert/update admin role in user_roles table
INSERT INTO public.user_roles (email, role)
VALUES ('tedx@dutse.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- 4. Verify everything (cast all to text to avoid UNION type mismatch)
SELECT '✅ User:' AS check_type, id::text, email, 
  CASE WHEN email_confirmed_at IS NOT NULL THEN 'yes' ELSE 'no' END AS email_confirmed
FROM auth.users WHERE email = 'tedx@dutse.com'
UNION ALL
SELECT '✅ Identity:' AS check_type, id::text, provider, 'yes'
FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tedx@dutse.com')
UNION ALL
SELECT '✅ Role:' AS check_type, id::text, role, 'yes'
FROM public.user_roles WHERE email = 'tedx@dutse.com';
