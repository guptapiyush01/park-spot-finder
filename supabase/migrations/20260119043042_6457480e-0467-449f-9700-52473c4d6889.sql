-- Add user_id column to parking_spots to track who added the spot
ALTER TABLE public.parking_spots ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Add status column for moderation (pending, approved, rejected)
ALTER TABLE public.parking_spots ADD COLUMN status text NOT NULL DEFAULT 'approved';

-- Add description column
ALTER TABLE public.parking_spots ADD COLUMN description text;

-- Create RLS policy for authenticated users to insert spots
CREATE POLICY "Authenticated users can add parking spots"
ON public.parking_spots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for users to update their own spots
CREATE POLICY "Users can update their own parking spots"
ON public.parking_spots
FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policy for users to delete their own spots
CREATE POLICY "Users can delete their own parking spots"
ON public.parking_spots
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for parking spot images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('parking-spots', 'parking-spots', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create storage policies for parking spot images
CREATE POLICY "Anyone can view parking spot images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'parking-spots');

CREATE POLICY "Authenticated users can upload parking spot images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parking-spots');

CREATE POLICY "Users can update their own parking spot images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'parking-spots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own parking spot images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'parking-spots' AND auth.uid()::text = (storage.foldername(name))[1]);