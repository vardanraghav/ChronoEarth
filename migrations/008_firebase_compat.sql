-- Migration: Adjust Supabase tables for Firebase Authentication compatibility
-- 1. Drop foreign key constraints referencing auth.users(id)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
ALTER TABLE IF EXISTS public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS public.futurechat_conversations DROP CONSTRAINT IF EXISTS futurechat_conversations_user_id_fkey CASCADE;

-- 2. Drop the trigger that synced auth.users with public.profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Alter ID columns from UUID to text to allow storing Firebase UIDs
ALTER TABLE public.profiles ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.user_preferences ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.futurechat_conversations ALTER COLUMN user_id TYPE text USING user_id::text;

-- 4. Disable Row-Level Security (RLS) on these tables so that the client,
-- operating with the anonymous key (without a Supabase JWT), can query them.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.futurechat_conversations DISABLE ROW LEVEL SECURITY;
