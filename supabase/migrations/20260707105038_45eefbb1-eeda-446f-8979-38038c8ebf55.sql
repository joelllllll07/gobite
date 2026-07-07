
CREATE TABLE public.saved_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  photo_url TEXT,
  rating NUMERIC,
  user_ratings_total INTEGER,
  price_level INTEGER,
  types TEXT[],
  lat NUMERIC,
  lng NUMERIC,
  list_type TEXT NOT NULL DEFAULT 'favorite' CHECK (list_type IN ('favorite','wishlist','visited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, place_id, list_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_places TO authenticated;
GRANT ALL ON public.saved_places TO service_role;

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved places"
ON public.saved_places FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
