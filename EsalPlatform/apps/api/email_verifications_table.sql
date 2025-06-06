-- Create email_verifications table for 6-digit code verification
-- Run this in Supabase SQL Editor

-- Create the email_verifications table
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Add unique constraint to prevent duplicate codes for same user
    CONSTRAINT unique_user_code UNIQUE(user_id, code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON public.email_verifications(code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON public.email_verifications(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy 1: Users can view their own verification codes
CREATE POLICY "Users can view own verification codes" 
ON public.email_verifications
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own verification codes
CREATE POLICY "Users can insert own verification codes" 
ON public.email_verifications
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own verification codes
CREATE POLICY "Users can update own verification codes" 
ON public.email_verifications
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy 4: Service role can manage all verification codes
CREATE POLICY "Service role can manage all verification codes" 
ON public.email_verifications
FOR ALL 
USING (auth.role() = 'service_role');

-- Policy 5: Allow anonymous users to insert verification codes (for signup process)
CREATE POLICY "Anonymous can insert verification codes for signup" 
ON public.email_verifications
FOR INSERT 
WITH CHECK (auth.role() = 'anon');

-- Policy 6: Allow anonymous users to read verification codes (for verification process)
CREATE POLICY "Anonymous can read verification codes for verification" 
ON public.email_verifications
FOR SELECT 
USING (auth.role() = 'anon');

-- Add comments for documentation
COMMENT ON TABLE public.email_verifications IS 'Stores 6-digit verification codes for email verification during user registration';
COMMENT ON COLUMN public.email_verifications.id IS 'Unique identifier for the verification record';
COMMENT ON COLUMN public.email_verifications.user_id IS 'Reference to the user in auth.users table';
COMMENT ON COLUMN public.email_verifications.email IS 'Email address that needs to be verified';
COMMENT ON COLUMN public.email_verifications.code IS '6-digit verification code sent to user';
COMMENT ON COLUMN public.email_verifications.expires_at IS 'When the verification code expires';
COMMENT ON COLUMN public.email_verifications.is_used IS 'Whether the code has been used for verification';
COMMENT ON COLUMN public.email_verifications.created_at IS 'When the verification code was created';
COMMENT ON COLUMN public.email_verifications.verified_at IS 'When the code was successfully verified';
