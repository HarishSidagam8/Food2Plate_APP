-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  green_points INTEGER DEFAULT 0 NOT NULL,
  badge_level TEXT DEFAULT 'Bronze' NOT NULL,
  total_food_saved_kg NUMERIC DEFAULT 0 NOT NULL,
  total_co2_saved_kg NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all rewards"
  ON public.rewards
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own rewards"
  ON public.rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON public.rewards
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to calculate badge level
CREATE OR REPLACE FUNCTION public.calculate_badge_level(points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
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

-- Function to update rewards when food post is created
CREATE OR REPLACE FUNCTION public.update_rewards_on_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  donor_user_id UUID;
  food_weight NUMERIC;
  co2_amount NUMERIC;
  new_points INTEGER;
BEGIN
  -- Get donor's user_id
  SELECT user_id INTO donor_user_id
  FROM public.profiles
  WHERE id = NEW.donor_id;

  -- Extract weight from quantity (assume format like "5 kg" or "5kg")
  food_weight := COALESCE(
    (regexp_match(NEW.quantity, '(\d+\.?\d*)'))[1]::NUMERIC,
    5 -- default to 5 kg if can't parse
  );

  -- Calculate CO2 saved (food_kg * 2.4)
  co2_amount := food_weight * 2.4;

  -- Insert or update rewards (donor gets +10 points)
  INSERT INTO public.rewards (user_id, profile_id, green_points, total_food_saved_kg, total_co2_saved_kg, badge_level)
  VALUES (
    donor_user_id,
    NEW.donor_id,
    10,
    food_weight,
    co2_amount,
    'Bronze'
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    green_points = public.rewards.green_points + 10,
    total_food_saved_kg = public.rewards.total_food_saved_kg + food_weight,
    total_co2_saved_kg = public.rewards.total_co2_saved_kg + co2_amount,
    badge_level = calculate_badge_level(public.rewards.green_points + 10),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Function to update rewards when reservation is created
CREATE OR REPLACE FUNCTION public.update_rewards_on_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receiver_user_id UUID;
BEGIN
  -- Get receiver's user_id
  SELECT user_id INTO receiver_user_id
  FROM public.profiles
  WHERE id = NEW.receiver_id;

  -- Insert or update rewards (receiver gets +5 points)
  INSERT INTO public.rewards (user_id, profile_id, green_points, badge_level)
  VALUES (
    receiver_user_id,
    NEW.receiver_id,
    5,
    'Bronze'
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    green_points = public.rewards.green_points + 5,
    badge_level = calculate_badge_level(public.rewards.green_points + 5),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER trigger_update_rewards_on_donation
  AFTER INSERT ON public.food_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rewards_on_donation();

CREATE TRIGGER trigger_update_rewards_on_reservation
  AFTER INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rewards_on_reservation();

-- Trigger for updated_at
CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();