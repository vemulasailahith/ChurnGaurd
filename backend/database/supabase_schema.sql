-- ==============================================================================
-- ChurnGuard — Supabase Authentication & Authorized Members Schema
-- ==============================================================================
--
-- Access Model: Single tier ("Authorized Company Member")
-- Only users whose Supabase Auth user_id exists in authorized_members
-- AND whose is_active value is TRUE are granted access to ChurnGuard.
--
-- Execute this script in your Supabase Project:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create the authorized_members table
CREATE TABLE IF NOT EXISTS public.authorized_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT authorized_members_user_id_key UNIQUE (user_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_authorized_members_user_id ON public.authorized_members (user_id);
CREATE INDEX IF NOT EXISTS idx_authorized_members_email ON public.authorized_members (email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.authorized_members ENABLE ROW LEVEL SECURITY;

-- 4. Grant table privileges to Supabase roles
GRANT ALL ON public.authorized_members TO service_role;
GRANT SELECT ON public.authorized_members TO authenticated;

-- 5. RLS Policies
-- Policy: Authenticated users can ONLY view their own authorization record.
-- Regular users CANNOT view other members' records.
DROP POLICY IF EXISTS "Allow members to read own record" ON public.authorized_members;
CREATE POLICY "Allow members to read own record"
ON public.authorized_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Block regular users from inserting themselves into authorized_members.
-- Only administrators using the Supabase Service Role (or Supabase Dashboard) can insert members.
DROP POLICY IF EXISTS "Prevent normal users from inserting records" ON public.authorized_members;
CREATE POLICY "Prevent normal users from inserting records"
ON public.authorized_members
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy: Block regular users from updating authorization status or fields.
DROP POLICY IF EXISTS "Prevent normal users from modifying records" ON public.authorized_members;
CREATE POLICY "Prevent normal users from modifying records"
ON public.authorized_members
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Policy: Block regular users from deleting records.
DROP POLICY IF EXISTS "Prevent normal users from deleting records" ON public.authorized_members;
CREATE POLICY "Prevent normal users from deleting records"
ON public.authorized_members
FOR DELETE
TO authenticated
USING (false);

-- ==============================================================================
-- HOW TO CREATE THE FIRST AUTHORIZED COMPANY MEMBER:
-- ------------------------------------------------------------------------------
-- Step 1: Go to Supabase Dashboard -> Authentication -> Users.
-- Step 2: Click "Add user" -> "Create user".
--         Enter the member's email (e.g. member@company.com) and password.
--         Click "Create user".
-- Step 3: Copy the User UID (e.g. '00000000-0000-0000-0000-000000000000').
-- Step 4: Run the following SQL query replacing the UID and details:
--
-- INSERT INTO public.authorized_members (user_id, email, full_name, is_active)
-- VALUES (
--     'YOUR-USER-UID-HERE',
--     'member@company.com',
--     'Authorized Team Member',
--     true
-- );
-- ==============================================================================
