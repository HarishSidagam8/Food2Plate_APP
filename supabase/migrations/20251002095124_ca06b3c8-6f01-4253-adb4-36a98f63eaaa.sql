-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_donor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.ratings
      WHERE donor_id = NEW.donor_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE donor_id = NEW.donor_id
    )
  WHERE id = NEW.donor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.expire_old_posts()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.food_posts
  SET status = 'expired'
  WHERE status = 'available'
  AND available_until < NOW();
END;
$$;