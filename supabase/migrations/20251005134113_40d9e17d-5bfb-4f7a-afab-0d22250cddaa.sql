-- Fix function search_path for calculate_badge_level
CREATE OR REPLACE FUNCTION public.calculate_badge_level(points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF points >= 700 THEN
    RETURN 'Platinum';
  ELSIF points >= 300 THEN
    RETURN 'Gold';
  ELSIF points >= 100 THEN
    RETURN 'Silver';
  ELSE
    RETURN 'Bronze';
  END IF;
END;
$$;