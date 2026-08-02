CREATE TABLE IF NOT EXISTS public.leaderboard_stats (
  user_id uuid PRIMARY KEY,
  total_points integer NOT NULL DEFAULT 0,
  exams_taken integer NOT NULL DEFAULT 0,
  sum_percentage integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.leaderboard_stats TO authenticated;
GRANT ALL ON public.leaderboard_stats TO service_role;

ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard stats readable by signed-in users"
  ON public.leaderboard_stats FOR SELECT TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION private.sync_leaderboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leaderboard_stats (user_id, total_points, exams_taken, sum_percentage, updated_at)
  VALUES (NEW.user_id, NEW.points, 1, NEW.percentage, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = public.leaderboard_stats.total_points + EXCLUDED.total_points,
        exams_taken = public.leaderboard_stats.exams_taken + 1,
        sum_percentage = public.leaderboard_stats.sum_percentage + EXCLUDED.sum_percentage,
        updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.sync_leaderboard_stats() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS sync_leaderboard_stats_trg ON public.exam_results;
CREATE TRIGGER sync_leaderboard_stats_trg
AFTER INSERT ON public.exam_results
FOR EACH ROW EXECUTE FUNCTION private.sync_leaderboard_stats();

-- Backfill
INSERT INTO public.leaderboard_stats (user_id, total_points, exams_taken, sum_percentage)
SELECT user_id, COALESCE(SUM(points),0)::int, COUNT(*)::int, COALESCE(SUM(percentage),0)::int
FROM public.exam_results GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE
  SET total_points = EXCLUDED.total_points,
      exams_taken = EXCLUDED.exams_taken,
      sum_percentage = EXCLUDED.sum_percentage;

DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
WITH (security_invoker = on) AS
  SELECT p.user_id,
     p.display_name,
     p.avatar_url,
     p.grade,
     COALESCE(s.total_points, 0) AS total_points,
     COALESCE(s.exams_taken, 0) AS exams_taken,
     CASE WHEN COALESCE(s.exams_taken, 0) = 0 THEN 0
          ELSE round(s.sum_percentage::numeric / s.exams_taken)::int END AS avg_percentage
  FROM public.profiles p
  LEFT JOIN public.leaderboard_stats s ON s.user_id = p.user_id;

GRANT SELECT ON public.leaderboard TO authenticated;