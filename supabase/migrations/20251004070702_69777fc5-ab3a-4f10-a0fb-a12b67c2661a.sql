-- Add profile fields for restaurant details and images
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_restaurant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS restaurant_name TEXT,
ADD COLUMN IF NOT EXISTS restaurant_description TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;