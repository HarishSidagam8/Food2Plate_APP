-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a restrictive policy: users can only view their own complete profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a security definer function to get safe public profile data
-- This returns only non-sensitive information: name, restaurant details, and ratings
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role TEXT,
  rating NUMERIC,
  total_ratings INTEGER,
  is_restaurant BOOLEAN,
  restaurant_name TEXT,
  restaurant_description TEXT,
  profile_image_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    full_name,
    role::TEXT,
    rating,
    total_ratings,
    is_restaurant,
    restaurant_name,
    restaurant_description,
    profile_image_url
  FROM public.profiles
  WHERE user_id = profile_user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile(UUID) TO authenticated;

-- Create a helper function to get public profiles for food post donors
CREATE OR REPLACE FUNCTION public.get_donor_public_profile(donor_profile_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role TEXT,
  rating NUMERIC,
  total_ratings INTEGER,
  is_restaurant BOOLEAN,
  restaurant_name TEXT,
  restaurant_description TEXT,
  profile_image_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    full_name,
    role::TEXT,
    rating,
    total_ratings,
    is_restaurant,
    restaurant_name,
    restaurant_description,
    profile_image_url
  FROM public.profiles
  WHERE id = donor_profile_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_donor_public_profile(UUID) TO authenticated;