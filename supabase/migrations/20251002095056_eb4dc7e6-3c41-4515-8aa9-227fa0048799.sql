-- Create function to automatically expire old posts
CREATE OR REPLACE FUNCTION public.expire_old_posts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.food_posts
  SET status = 'expired'
  WHERE status = 'available'
  AND available_until < NOW();
END;
$$;

-- Note: In production, you would set up a cron job to run this function periodically
-- For now, we'll call it from the frontend when loading posts