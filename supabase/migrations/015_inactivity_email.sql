-- Inactivity nudge emails: track last send, query candidates + platform summary.

alter table public.profiles
  add column if not exists last_inactivity_email_at timestamptz;

-- Users who logged before but nothing in 72h+ (one email per idle stretch).
create or replace function public.get_inactivity_nudge_candidates()
returns json
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_result json;
begin
  select coalesce(
    json_agg(
      json_build_object(
        'user_id', p.id,
        'email', u.email,
        'username', p.username,
        'last_logged_at', p.last_logged_at,
        'hours_since', round(
          extract(epoch from (now() - p.last_logged_at)) / 3600
        )::int
      )
      order by p.last_logged_at asc
    ),
    '[]'::json
  )
  into v_result
  from public.profiles p
  inner join auth.users u on u.id = p.id
  where p.last_logged_at is not null
    and p.last_logged_at < now() - interval '72 hours'
    and u.email is not null
    and (
      p.last_inactivity_email_at is null
      or p.last_inactivity_email_at < p.last_logged_at
    );

  return v_result;
end;
$$;

-- What everyone else did in the last 72h (for email copy).
create or replace function public.get_platform_activity_summary(p_hours int default 72)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  select coalesce(
    json_agg(t.row_data order by t.sessions desc, t.points desc),
    '[]'::json
  )
  into v_result
  from (
    select
      json_build_object(
        'username', p.username,
        'sessions', count(w.id)::int,
        'points', coalesce(sum(w.total_points), 0)::int,
        'last_note', (
          select w2.notes
          from public.workout_logs w2
          where w2.user_id = p.id
            and w2.created_at >= now() - make_interval(hours => p_hours)
            and w2.notes is not null
            and trim(w2.notes) <> ''
          order by w2.created_at desc
          limit 1
        )
      ) as row_data,
      count(w.id)::int as sessions,
      coalesce(sum(w.total_points), 0)::int as points
    from public.workout_logs w
    inner join public.profiles p on p.id = w.user_id
    where w.created_at >= now() - make_interval(hours => p_hours)
    group by p.id, p.username
    having count(w.id) > 0
  ) t;

  return v_result;
end;
$$;

create or replace function public.mark_inactivity_email_sent_system(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set last_inactivity_email_at = now(),
      updated_at = now()
  where id = p_user_id;
end;
$$;

revoke all on function public.get_inactivity_nudge_candidates() from public;
revoke all on function public.get_platform_activity_summary(int) from public;
revoke all on function public.mark_inactivity_email_sent_system(uuid) from public;

grant execute on function public.get_inactivity_nudge_candidates() to service_role;
grant execute on function public.get_platform_activity_summary(int) to service_role;
grant execute on function public.mark_inactivity_email_sent_system(uuid) to service_role;
