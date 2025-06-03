-- Fix brand profile creation issues

-- 1. Add INSERT policy for brand_profiles table
-- First check if the policy already exists and drop it if needed
DROP POLICY IF EXISTS "Brands can insert their own profile" ON public.brand_profiles;

-- Create INSERT policy for brand_profiles
CREATE POLICY "Brands can insert their own profile" 
ON public.brand_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow brands to create their own profile
  id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'brand'
  )
);

-- 2. Create storage bucket for profile-logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-logos', 'profile-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for profile-logos bucket
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to all images in the bucket (since they're logos)
CREATE POLICY "Public can view all logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-logos'); 