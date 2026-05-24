-- Create the admin user in Supabase Auth
-- Password: tedx-dutse@123 (bcrypt hashed)
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
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      confirmation_token,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'tedx@dutse.com',
      _encrypted_pw,
      NOW(),
      NOW(),
      '',
      '',
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      FALSE
    )
    RETURNING id INTO _user_id;
    
    -- Insert identity for the user (required for email login)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      _user_id,
      json_build_object('sub', _user_id::text, 'email', 'tedx@dutse.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Admin user created: tedx@dutse.com';
  ELSE
    RAISE NOTICE 'Admin user already exists with id: %', _user_id;
  END IF;
END $$;

-- Insert/upsert into user_roles
INSERT INTO public.user_roles (email, role)
VALUES ('tedx@dutse.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Verify
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.email = ur.email
WHERE u.email = 'tedx@dutse.com';
