-- Recreate the rating trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_rating_created ON public.ratings;

CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_donor_rating();