-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('donor', 'receiver');

-- Create enum for food post status
CREATE TYPE public.food_status AS ENUM ('available', 'reserved', 'expired', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL,
  phone TEXT,
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_posts table
CREATE TABLE public.food_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  description TEXT,
  pickup_location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  available_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.food_status DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_post_id UUID NOT NULL REFERENCES public.food_posts(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  pickup_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(food_post_id, receiver_id)
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reservation_id, receiver_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Food posts policies
CREATE POLICY "Anyone can view available food posts"
  ON public.food_posts FOR SELECT
  USING (true);

CREATE POLICY "Donors can create food posts"
  ON public.food_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = food_posts.donor_id
      AND profiles.role = 'donor'
    )
  );

CREATE POLICY "Donors can update their own posts"
  ON public.food_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = food_posts.donor_id
    )
  );

CREATE POLICY "Donors can delete their own posts"
  ON public.food_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = food_posts.donor_id
    )
  );

-- Reservations policies
CREATE POLICY "Users can view their own reservations"
  ON public.reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (profiles.id = reservations.receiver_id OR 
           profiles.id IN (SELECT donor_id FROM public.food_posts WHERE id = reservations.food_post_id))
    )
  );

CREATE POLICY "Receivers can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = reservations.receiver_id
      AND profiles.role = 'receiver'
    )
  );

CREATE POLICY "Users can update their own reservations"
  ON public.reservations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (profiles.id = reservations.receiver_id OR 
           profiles.id IN (SELECT donor_id FROM public.food_posts WHERE id = reservations.food_post_id))
    )
  );

-- Ratings policies
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Receivers can create ratings for completed reservations"
  ON public.ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = ratings.receiver_id
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_posts_updated_at
  BEFORE UPDATE ON public.food_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update donor rating
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
$$ LANGUAGE plpgsql;

-- Create trigger to update donor rating when new rating is added
CREATE TRIGGER update_donor_rating_trigger
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_donor_rating();

-- Create function to check and expire old food posts
CREATE OR REPLACE FUNCTION public.expire_old_posts()
RETURNS void AS $$
BEGIN
  UPDATE public.food_posts
  SET status = 'expired'
  WHERE status = 'available'
  AND available_until < NOW();
END;
$$ LANGUAGE plpgsql;