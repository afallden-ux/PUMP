-- Run once in Supabase SQL Editor to clear:
-- "View public.leaderboard_7d is defined with the SECURITY DEFINER property"

create or replace view public.leaderboard_7d
with (security_invoker = true)
as
select
  p.id,
  p.username,
  p.avatar_url,
  p.title,
  p.current_pump_score,
  p.last_logged_at,
  coalesce(sum(w.total_points), 0)::integer as points_7d,
  count(w.id)::integer as sessions_7d
from public.profiles p
left join public.workout_logs w
  on w.user_id = p.id
  and w.created_at >= (now() - interval '7 days')
group by p.id, p.username, p.avatar_url, p.title, p.current_pump_score, p.last_logged_at
order by points_7d desc, sessions_7d desc;

grant select on public.leaderboard_7d to authenticated;
