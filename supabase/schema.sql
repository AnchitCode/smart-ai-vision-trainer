-- ==========================================
-- SMART AI VISION TRAINER: SUPABASE SCHEMA
-- ==========================================
-- Paste this entire file into the Supabase SQL Editor and hit "Run".

-- 1. Create Tables
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamp with time zone,
  member_since timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.workout_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  total_reps integer DEFAULT 0 NOT NULL,
  good_reps integer DEFAULT 0 NOT NULL,
  bad_reps integer DEFAULT 0 NOT NULL
);

CREATE TABLE public.exercise_sets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.workout_sessions ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  exercise_type text NOT NULL,
  reps integer DEFAULT 0 NOT NULL
);

-- 2. Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Profiles: Users can view and update their own profiles
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workout Sessions: Users can CRUD their own sessions
CREATE POLICY "Users can view own workout sessions." ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions." ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions." ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- Exercise Sets: Users can CRUD their own sets
CREATE POLICY "Users can view own exercise sets." ON public.exercise_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise sets." ON public.exercise_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercise sets." ON public.exercise_sets FOR DELETE USING (auth.uid() = user_id);

-- 4. Create trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- That's it! Your schema is ready.
