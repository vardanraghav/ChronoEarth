-- Migration: Setup Auth, RBAC, Profiles, Preferences, and Chat History

-- 1. Create is_admin security definer function to prevent infinite RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_role UNIQUE (user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_cities jsonb DEFAULT '[]'::jsonb,
  favorite_companies jsonb DEFAULT '[]'::jsonb,
  selected_theme text DEFAULT 'cyber',
  default_timeline integer DEFAULT 2050,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 5. Create FutureChat Conversations table
CREATE TABLE IF NOT EXISTS public.futurechat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on futurechat_conversations
ALTER TABLE public.futurechat_conversations ENABLE ROW LEVEL SECURITY;

-- 6. Trigger Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = excluded.email,
      full_name = COALESCE(excluded.full_name, profiles.full_name),
      avatar_url = COALESCE(excluded.avatar_url, profiles.avatar_url);

  -- Insert role (admin@chronoearth.ai gets 'admin', all others get 'user')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    CASE 
      WHEN new.email = 'admin@chronoearth.ai' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert preferences
  INSERT INTO public.user_preferences (user_id, selected_theme, default_timeline)
  VALUES (
    new.id,
    'cyber',
    2050
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS Policies

-- PROFILES Policies
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));

-- USER_ROLES Policies
DROP POLICY IF EXISTS "Allow users to view their own role" ON public.user_roles;
CREATE POLICY "Allow users to view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- USER_PREFERENCES Policies
DROP POLICY IF EXISTS "Allow users to read their own preferences" ON public.user_preferences;
CREATE POLICY "Allow users to read their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow users to insert their own preferences" ON public.user_preferences;
CREATE POLICY "Allow users to insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own preferences" ON public.user_preferences;
CREATE POLICY "Allow users to update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all preferences" ON public.user_preferences;
CREATE POLICY "Admins can manage all preferences" ON public.user_preferences
  FOR ALL USING (public.is_admin(auth.uid()));

-- FUTURECHAT_CONVERSATIONS Policies
DROP POLICY IF EXISTS "Allow users to read their own chats" ON public.futurechat_conversations;
CREATE POLICY "Allow users to read their own chats" ON public.futurechat_conversations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow users to insert their own chats" ON public.futurechat_conversations;
CREATE POLICY "Allow users to insert their own chats" ON public.futurechat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.futurechat_conversations;
CREATE POLICY "Admins can manage all conversations" ON public.futurechat_conversations
  FOR ALL USING (public.is_admin(auth.uid()));
