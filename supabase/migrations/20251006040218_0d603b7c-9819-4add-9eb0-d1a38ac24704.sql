-- Add food quality analysis fields to food_posts table
ALTER TABLE public.food_posts
ADD COLUMN quality_status TEXT,
ADD COLUMN quality_confidence NUMERIC,
ADD COLUMN shelf_life_hours INTEGER,
ADD COLUMN quality_reasoning TEXT;