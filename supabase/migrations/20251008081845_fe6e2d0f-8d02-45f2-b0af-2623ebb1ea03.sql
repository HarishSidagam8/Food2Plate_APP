-- Refresh Supabase types by adding a comment to trigger regeneration
COMMENT ON TABLE public.profiles IS 'User profiles with role information';
COMMENT ON TABLE public.food_posts IS 'Food donation posts from donors';
COMMENT ON TABLE public.reservations IS 'Food reservations by receivers';
COMMENT ON TABLE public.ratings IS 'Ratings given by receivers to donors';
COMMENT ON TABLE public.rewards IS 'Rewards and gamification data for users';