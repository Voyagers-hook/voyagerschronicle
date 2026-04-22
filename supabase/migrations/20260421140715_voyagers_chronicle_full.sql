-- ============================================================
-- Voyagers Chronicle — Full Schema Migration
-- ============================================================

-- ── 1. TYPES ─────────────────────────────────────────────────
DROP TYPE IF EXISTS public.card_rarity CASCADE;
CREATE TYPE public.card_rarity AS ENUM ('Widespread', 'Elusive', 'Specimen', 'Legendary');

DROP TYPE IF EXISTS public.trade_status CASCADE;
CREATE TYPE public.trade_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

DROP TYPE IF EXISTS public.catch_status CASCADE;
CREATE TYPE public.catch_status AS ENUM ('pending', 'approved', 'rejected');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('member', 'admin');

-- ── 2. CORE TABLES ───────────────────────────────────────────

-- User profiles (linked to auth.users via trigger)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'member'::public.user_role,
  total_points INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_weeks INTEGER DEFAULT 0,
  membership_tier TEXT DEFAULT 'Explorer',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Master card catalogue (admin-managed)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  rarity public.card_rarity NOT NULL,
  image_url TEXT,
  power INTEGER NOT NULL DEFAULT 0,
  stealth INTEGER NOT NULL DEFAULT 0,
  stamina INTEGER NOT NULL DEFAULT 0,
  beauty INTEGER NOT NULL DEFAULT 0,
  habitat TEXT NOT NULL,
  description TEXT,
  foil BOOLEAN DEFAULT false,
  gradient TEXT DEFAULT 'from-gray-400 to-gray-600',
  border_color TEXT DEFAULT '#6B7280',
  total_cards INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User card collections
CREATE TABLE IF NOT EXISTS public.user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  collected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, card_id)
);

-- Trades
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  offered_card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  wanted_card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  trade_status public.trade_status DEFAULT 'pending'::public.trade_status,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  category TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'Easy',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Quiz scores
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  quiz_category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Catch submissions
CREATE TABLE IF NOT EXISTS public.catch_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  weight_kg DECIMAL(6,2),
  length_cm DECIMAL(6,2),
  location TEXT,
  notes TEXT,
  image_url TEXT,
  catch_status public.catch_status DEFAULT 'pending'::public.catch_status,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMPTZ
);

-- Rewards / points redemptions
CREATE TABLE IF NOT EXISTS public.rewards_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_label TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fun facts
CREATE TABLE IF NOT EXISTS public.fun_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  icon_name TEXT DEFAULT 'LightBulbIcon',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON public.user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_trades_from_user ON public.trades(from_user_id);
CREATE INDEX IF NOT EXISTS idx_trades_to_user ON public.trades(to_user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON public.quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_catch_submissions_user_id ON public.catch_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.rewards_redemptions(user_id);

-- ── 4. FUNCTIONS ─────────────────────────────────────────────

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Recalculate user total_points from their cards
CREATE OR REPLACE FUNCTION public.recalculate_user_points(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(c.power + c.stealth + c.stamina + c.beauty), 0)
  INTO v_total
  FROM public.user_cards uc
  JOIN public.cards c ON uc.card_id = c.id
  WHERE uc.user_id = p_user_id;

  UPDATE public.user_profiles
  SET total_points = v_total, updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id;
END;
$$;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (au.raw_user_meta_data->>'role' = 'admin' OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- ── 5. ENABLE RLS ────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catch_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_facts ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS POLICIES ──────────────────────────────────────────

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_view_all_profiles" ON public.user_profiles;
CREATE POLICY "users_view_all_profiles" ON public.user_profiles
FOR SELECT TO authenticated USING (true);

-- cards (public read, admin write)
DROP POLICY IF EXISTS "anyone_can_read_cards" ON public.cards;
CREATE POLICY "anyone_can_read_cards" ON public.cards
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_cards" ON public.cards;
CREATE POLICY "admin_manage_cards" ON public.cards
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- user_cards
DROP POLICY IF EXISTS "users_view_own_cards" ON public.user_cards;
CREATE POLICY "users_view_own_cards" ON public.user_cards
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_view_others_cards" ON public.user_cards;
CREATE POLICY "users_view_others_cards" ON public.user_cards
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_user_cards" ON public.user_cards;
CREATE POLICY "admin_manage_user_cards" ON public.user_cards
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- trades
DROP POLICY IF EXISTS "users_manage_own_trades" ON public.trades;
CREATE POLICY "users_manage_own_trades" ON public.trades
FOR ALL TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid())
WITH CHECK (from_user_id = auth.uid());

-- quiz_questions (public read, admin write)
DROP POLICY IF EXISTS "anyone_read_quiz_questions" ON public.quiz_questions;
CREATE POLICY "anyone_read_quiz_questions" ON public.quiz_questions
FOR SELECT TO authenticated USING (active = true);

DROP POLICY IF EXISTS "admin_manage_quiz_questions" ON public.quiz_questions;
CREATE POLICY "admin_manage_quiz_questions" ON public.quiz_questions
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- quiz_scores
DROP POLICY IF EXISTS "users_manage_own_scores" ON public.quiz_scores;
CREATE POLICY "users_manage_own_scores" ON public.quiz_scores
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_view_all_scores" ON public.quiz_scores;
CREATE POLICY "users_view_all_scores" ON public.quiz_scores
FOR SELECT TO authenticated USING (true);

-- catch_submissions
DROP POLICY IF EXISTS "users_manage_own_catches" ON public.catch_submissions;
CREATE POLICY "users_manage_own_catches" ON public.catch_submissions
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_view_all_catches" ON public.catch_submissions;
CREATE POLICY "admin_view_all_catches" ON public.catch_submissions
FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_catches" ON public.catch_submissions;
CREATE POLICY "admin_update_catches" ON public.catch_submissions
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- rewards_redemptions
DROP POLICY IF EXISTS "users_manage_own_rewards" ON public.rewards_redemptions;
CREATE POLICY "users_manage_own_rewards" ON public.rewards_redemptions
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- fun_facts
DROP POLICY IF EXISTS "anyone_read_fun_facts" ON public.fun_facts;
CREATE POLICY "anyone_read_fun_facts" ON public.fun_facts
FOR SELECT TO authenticated USING (active = true);

DROP POLICY IF EXISTS "admin_manage_fun_facts" ON public.fun_facts;
CREATE POLICY "admin_manage_fun_facts" ON public.fun_facts
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 7. TRIGGERS ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_trades_updated_at ON public.trades;
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── 8. SEED DATA ─────────────────────────────────────────────

-- Insert all 24 fishing cards
INSERT INTO public.cards (card_number, name, species, rarity, power, stealth, stamina, beauty, habitat, description, foil, gradient, border_color)
VALUES
  (1,  'Murray Cod',      'Maccullochella peelii',   'Legendary', 95, 70, 90, 85, 'River',   'The king of Australian freshwater fish. Massive and powerful.',           true,  'from-amber-400 via-yellow-300 to-amber-500',   '#F59E0B'),
  (2,  'Rainbow Trout',   'Oncorhynchus mykiss',     'Specimen',  72, 60, 65, 90, 'Stream',  'Prized for its stunning colours and fighting spirit.',                   false, 'from-blue-400 via-cyan-300 to-teal-400',       '#3B82F6'),
  (3,  'Golden Perch',    'Macquaria ambigua',       'Specimen',  81, 55, 75, 88, 'Lake',    'Gleaming golden scales that shimmer in the sunlight.',                   true,  'from-yellow-400 via-amber-300 to-orange-400',  '#F59E0B'),
  (4,  'Barramundi',      'Lates calcarifer',        'Specimen',  88, 65, 80, 78, 'Coast',   'The iconic Aussie sport fish. Fast, strong, and delicious.',             false, 'from-teal-400 via-emerald-300 to-green-400',   '#10B981'),
  (5,  'Flathead',        'Platycephalus fuscus',    'Elusive',   58, 85, 60, 45, 'Coast',   'A sneaky ambush predator hiding in the sand.',                           false, 'from-gray-400 via-slate-300 to-gray-500',      '#6B7280'),
  (6,  'Yellowfin Bream', 'Acanthopagrus australis', 'Widespread',42, 50, 45, 65, 'Estuary', 'A reliable catch for young anglers learning the ropes.',                 false, 'from-yellow-300 via-amber-200 to-yellow-400',  '#FCD34D'),
  (7,  'Silver Perch',    'Bidyanus bidyanus',       'Elusive',   55, 70, 58, 60, 'River',   'A native gem making a comeback in our waterways.',                       false, 'from-slate-300 via-gray-200 to-slate-400',     '#94A3B8'),
  (8,  'Snapper',         'Chrysophrys auratus',     'Specimen',  76, 62, 70, 82, 'Ocean',   'The red beauty of the deep. A trophy catch for any angler.',             false, 'from-red-400 via-rose-300 to-red-500',         '#EF4444'),
  (9,  'Whiting',         'Sillago ciliata',         'Widespread',35, 55, 38, 58, 'Beach',   'Perfect for beginners. Tasty and fun to catch from the beach.',          false, 'from-stone-300 via-zinc-200 to-stone-400',     '#A8A29E'),
  (10, 'Jewfish',         'Argyrosomus japonicus',   'Specimen',  84, 78, 82, 75, 'Estuary', 'A powerful fighter that tests every anglers skill.',                     true,  'from-indigo-400 via-violet-300 to-purple-400', '#8B5CF6'),
  (11, 'Carp',            'Cyprinus carpio',         'Widespread',28, 40, 50, 30, 'Lake',    'Introduced but widespread. Great for practice casting.',                 false, 'from-amber-700 via-yellow-600 to-amber-800',   '#92400E'),
  (12, 'Kingfish',        'Seriola lalandi',         'Legendary', 97, 80, 95, 88, 'Ocean',   'The ultimate offshore trophy. Speed and power combined.',                true,  'from-amber-400 via-yellow-300 to-amber-500',   '#F59E0B'),
  (13, 'Luderick',        'Girella tricuspidata',    'Elusive',   48, 80, 52, 55, 'Rock',    'The blackfish. A challenging catch requiring patience.',                  false, 'from-gray-700 via-slate-600 to-gray-800',      '#374151'),
  (14, 'Tailor',          'Pomatomus saltatrix',     'Widespread',45, 60, 48, 52, 'Beach',   'Fast and ferocious. Watch those teeth!',                                 false, 'from-cyan-400 via-sky-300 to-blue-400',        '#06B6D4'),
  (15, 'Trevally',        'Caranx ignobilis',        'Specimen',  70, 65, 72, 68, 'Reef',    'A hard-fighting schooling fish loved by sport anglers.',                 false, 'from-teal-500 via-cyan-400 to-teal-600',       '#14B8A6'),
  (16, 'Catfish',         'Tandanus tandanus',       'Widespread',32, 65, 42, 35, 'River',   'The whiskered bottom-dweller of our rivers.',                            false, 'from-stone-400 via-amber-300 to-stone-500',    '#78716C'),
  (17, 'Marlin',          'Makaira nigricans',       'Legendary', 99, 75, 98, 92, 'Ocean',   'The ultimate game fish. A once-in-a-lifetime catch.',                    true,  'from-blue-600 via-indigo-500 to-blue-700',     '#2563EB'),
  (18, 'Redfin Perch',    'Perca fluviatilis',       'Elusive',   52, 68, 55, 70, 'Lake',    'Striking red fins make this an eye-catching catch.',                     false, 'from-red-300 via-rose-200 to-red-400',         '#F87171'),
  (19, 'Mackerel',        'Scomberomorus commerson', 'Specimen',  74, 72, 76, 70, 'Ocean',   'Lightning fast. A blur of silver in the blue water.',                    false, 'from-sky-400 via-blue-300 to-sky-500',         '#38BDF8'),
  (20, 'Estuary Perch',   'Macquaria colonorum',     'Elusive',   60, 75, 62, 68, 'Estuary', 'A stealthy predator lurking in mangrove roots.',                         false, 'from-green-400 via-emerald-300 to-green-500',  '#22C55E'),
  (21, 'Mulloway',        'Argyrosomus japonicus',   'Specimen',  86, 82, 84, 78, 'Estuary', 'The ghost of the estuary. Best caught at night.',                        true,  'from-violet-500 via-purple-400 to-violet-600', '#7C3AED'),
  (22, 'Bream',           'Acanthopagrus butcheri',  'Widespread',40, 52, 44, 48, 'Estuary', 'The bread-and-butter fish of Australian estuaries.',                     false, 'from-zinc-300 via-gray-200 to-zinc-400',       '#A1A1AA'),
  (23, 'Salmon Trout',    'Salmo trutta',            'Specimen',  68, 58, 65, 80, 'Stream',  'Introduced from Europe, now a prized catch in cold streams.',            false, 'from-orange-400 via-amber-300 to-orange-500',  '#F97316'),
  (24, 'The Voyager',     'Mythicus voyagerus',      'Legendary', 100,100,100,100,'Legend',  'The rarest card of all. Only true Voyagers can unlock this.',            true,  'from-amber-400 via-yellow-300 to-amber-500',   '#F59E0B')
ON CONFLICT (card_number) DO NOTHING;

-- Insert fun facts
INSERT INTO public.fun_facts (title, content, category, icon_name)
VALUES
  ('Fish Can See Colour', 'Most fish can see colour, and some can even see ultraviolet light that humans cannot detect. Rainbow trout use colour vision to find food!', 'Biology', 'EyeIcon'),
  ('Barramundi Change Sex', 'Barramundi are protandrous hermaphrodites — they start life as males and change to females as they grow older and larger. Amazing!', 'Species', 'SparklesIcon'),
  ('Murray Cod Age', 'Murray Cod can live for over 48 years! The oldest recorded Murray Cod was estimated to be around 48 years old when caught.', 'Species', 'ClockIcon'),
  ('Fish Sleep Too', 'Fish do sleep, but not like us. They enter a restful state where they slow down and hover in place. Some even change colour while resting!', 'Biology', 'MoonIcon'),
  ('Catch and Release', 'When you catch and release a fish properly, it has a very high survival rate. Wet your hands before handling and return it quickly!', 'Conservation', 'HeartIcon'),
  ('Trout Need Cold Water', 'Rainbow Trout need cold, well-oxygenated water to survive. They are often found in mountain streams and rivers where the water stays cool.', 'Habitat', 'BeakerIcon'),
  ('Flathead Camouflage', 'Flathead are masters of disguise! They bury themselves in sand or mud with only their eyes showing, waiting to ambush prey.', 'Species', 'EyeSlashIcon'),
  ('Fish Scales Tell Age', 'Just like tree rings, you can count the rings on a fish scale to determine its age. Each ring represents one year of growth!', 'Biology', 'MagnifyingGlassIcon'),
  ('Bream Are Smart', 'Yellowfin Bream have been shown to learn from experience. They can remember locations where they found food and avoid places where they were caught before!', 'Species', 'AcademicCapIcon')
ON CONFLICT DO NOTHING;

-- Insert quiz questions
INSERT INTO public.quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, category, difficulty)
VALUES
  ('What is the largest freshwater fish in Australia?', 'Barramundi', 'Murray Cod', 'Golden Perch', 'Silver Perch', 'B', 'Murray Cod is the largest freshwater fish in Australia, growing up to 1.8 metres and weighing over 100kg!', 'Species', 'Easy'),
  ('What does "catch and release" mean?', 'Keeping the fish to eat', 'Throwing the fish back after catching it', 'Releasing your fishing line', 'Catching fish with a net', 'B', 'Catch and release means carefully returning the fish to the water after catching it, helping to conserve fish populations.', 'Conservation', 'Easy'),
  ('Which fish is known for changing sex as it grows?', 'Rainbow Trout', 'Flathead', 'Barramundi', 'Snapper', 'C', 'Barramundi start life as males and change to females as they grow larger — a process called protandrous hermaphroditism.', 'Species', 'Medium'),
  ('What type of water do Rainbow Trout prefer?', 'Warm, still water', 'Cold, fast-flowing water', 'Salty ocean water', 'Muddy river water', 'B', 'Rainbow Trout thrive in cold, well-oxygenated water, typically found in mountain streams and rivers.', 'Habitat', 'Easy'),
  ('How can you tell a fish''s age?', 'By its colour', 'By counting scale rings', 'By measuring its length', 'By its weight', 'B', 'Fish scales have growth rings similar to tree rings. Each ring represents one year of growth.', 'Biology', 'Medium'),
  ('What is the best way to handle a fish before releasing it?', 'Use dry gloves', 'Wet your hands first', 'Use a towel', 'Grip it tightly by the gills', 'B', 'Wetting your hands before handling a fish protects its protective slime coat, which helps prevent infection.', 'Conservation', 'Easy'),
  ('Where does the Flathead hide to catch prey?', 'In coral reefs', 'In open water', 'Buried in sand or mud', 'In underwater caves', 'C', 'Flathead are ambush predators that bury themselves in sand or mud with only their eyes showing, waiting for prey to swim past.', 'Species', 'Medium'),
  ('What is the scientific name for Murray Cod?', 'Lates calcarifer', 'Maccullochella peelii', 'Oncorhynchus mykiss', 'Seriola lalandi', 'B', 'The scientific name for Murray Cod is Maccullochella peelii, named after the Murray-Darling river system.', 'Species', 'Hard'),
  ('Which fish is sometimes called the "ghost of the estuary"?', 'Barramundi', 'Jewfish', 'Mulloway', 'Snapper', 'C', 'Mulloway are called the ghost of the estuary because they are elusive, often feeding at night and hard to catch.', 'Species', 'Hard')
ON CONFLICT DO NOTHING;

-- ── 9. MOCK USERS ────────────────────────────────────────────
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  finn_uuid  UUID := gen_random_uuid();
  tom_uuid   UUID := gen_random_uuid();
  mia_uuid   UUID := gen_random_uuid();
  murray_cod_id UUID;
  rainbow_trout_id UUID;
  golden_perch_id UUID;
  flathead_id UUID;
  bream_id UUID;
  whiting_id UUID;
  tailor_id UUID;
  catfish_id UUID;
  estuary_perch_id UUID;
  carp_id UUID;
BEGIN
  -- Create auth users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@voyagershook.com', crypt('Admin2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('username', 'Admin', 'role', 'admin'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[], 'role', 'admin'),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (finn_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'finn@example.com', crypt('Voyage2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('username', 'Finn Mackenzie'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (tom_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'tom@example.com', crypt('Angler2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('username', 'Tom Mackenzie'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (mia_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'mia@example.com', crypt('Angler2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('username', 'Mia Chen'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- Update profiles with extra data
  UPDATE public.user_profiles SET
    xp = 680, level = 7, streak_weeks = 4, membership_tier = 'Gold Explorer', total_points = 1330
  WHERE id = finn_uuid;

  UPDATE public.user_profiles SET
    xp = 950, level = 10, streak_weeks = 8, membership_tier = 'Legend Member', total_points = 1570
  WHERE id = tom_uuid;

  UPDATE public.user_profiles SET
    xp = 820, level = 9, streak_weeks = 6, membership_tier = 'Gold Explorer', total_points = 1440
  WHERE id = mia_uuid;

  -- Get card IDs
  SELECT id INTO murray_cod_id FROM public.cards WHERE card_number = 1 LIMIT 1;
  SELECT id INTO rainbow_trout_id FROM public.cards WHERE card_number = 2 LIMIT 1;
  SELECT id INTO golden_perch_id FROM public.cards WHERE card_number = 3 LIMIT 1;
  SELECT id INTO flathead_id FROM public.cards WHERE card_number = 5 LIMIT 1;
  SELECT id INTO bream_id FROM public.cards WHERE card_number = 22 LIMIT 1;
  SELECT id INTO whiting_id FROM public.cards WHERE card_number = 9 LIMIT 1;
  SELECT id INTO tailor_id FROM public.cards WHERE card_number = 14 LIMIT 1;
  SELECT id INTO catfish_id FROM public.cards WHERE card_number = 16 LIMIT 1;
  SELECT id INTO estuary_perch_id FROM public.cards WHERE card_number = 20 LIMIT 1;
  SELECT id INTO carp_id FROM public.cards WHERE card_number = 11 LIMIT 1;

  -- Give Finn some cards
  IF finn_uuid IS NOT NULL AND murray_cod_id IS NOT NULL THEN
    INSERT INTO public.user_cards (user_id, card_id, collected_at) VALUES
      (finn_uuid, murray_cod_id, now() - interval '7 days'),
      (finn_uuid, rainbow_trout_id, now() - interval '11 days'),
      (finn_uuid, golden_perch_id, now() - interval '13 days'),
      (finn_uuid, flathead_id, now() - interval '19 days'),
      (finn_uuid, bream_id, now() - interval '23 days'),
      (finn_uuid, whiting_id, now() - interval '32 days'),
      (finn_uuid, tailor_id, now() - interval '46 days'),
      (finn_uuid, catfish_id, now() - interval '51 days'),
      (finn_uuid, estuary_perch_id, now() - interval '59 days'),
      (finn_uuid, carp_id, now() - interval '67 days')
    ON CONFLICT (user_id, card_id) DO NOTHING;
  END IF;

  -- Give Tom some cards
  IF tom_uuid IS NOT NULL AND murray_cod_id IS NOT NULL THEN
    INSERT INTO public.user_cards (user_id, card_id, collected_at) VALUES
      (tom_uuid, murray_cod_id, now() - interval '5 days'),
      (tom_uuid, rainbow_trout_id, now() - interval '8 days'),
      (tom_uuid, golden_perch_id, now() - interval '10 days'),
      (tom_uuid, flathead_id, now() - interval '15 days'),
      (tom_uuid, bream_id, now() - interval '20 days'),
      (tom_uuid, whiting_id, now() - interval '25 days'),
      (tom_uuid, tailor_id, now() - interval '30 days'),
      (tom_uuid, catfish_id, now() - interval '35 days'),
      (tom_uuid, estuary_perch_id, now() - interval '40 days'),
      (tom_uuid, carp_id, now() - interval '45 days')
    ON CONFLICT (user_id, card_id) DO NOTHING;
  END IF;

  -- Add some catch submissions for Finn
  IF finn_uuid IS NOT NULL THEN
    INSERT INTO public.catch_submissions (user_id, species, weight_kg, length_cm, location, notes, catch_status) VALUES
      (finn_uuid, 'Rainbow Trout', 1.2, 42.0, 'Somerset River', 'Beautiful fish, released safely', 'approved'),
      (finn_uuid, 'Murray Cod', 3.5, 65.0, 'Murray River', 'Biggest catch yet!', 'approved'),
      (finn_uuid, 'Flathead', 0.8, 38.0, 'Coastal estuary', 'Caught on lure', 'pending')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add quiz scores
  IF finn_uuid IS NOT NULL THEN
    INSERT INTO public.quiz_scores (user_id, quiz_category, score, total_questions) VALUES
      (finn_uuid, 'Species', 8, 9),
      (finn_uuid, 'Conservation', 7, 9),
      (finn_uuid, 'Habitat', 6, 9)
    ON CONFLICT DO NOTHING;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data error: %', SQLERRM;
END $$;
