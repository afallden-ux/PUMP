-- =============================================================================
-- PUMP — NEW UPDATES ONLY (run if you already ran 001 / the first big migration)
-- Supabase → SQL Editor → paste all → Run
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible
-- =============================================================================

-- ##############################################################################
-- 002 — Session photos
-- ##############################################################################

alter table public.workout_logs
  add column if not exists photo_url text;

drop policy if exists "Users can update own workout logs" on public.workout_logs;
create policy "Users can update own workout logs"
  on public.workout_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('workout-photos', 'workout-photos', true)
on conflict (id) do nothing;

drop policy if exists "Workout photos are publicly accessible" on storage.objects;
create policy "Workout photos are publicly accessible"
  on storage.objects for select using (bucket_id = 'workout-photos');

drop policy if exists "Users can upload own workout photos" on storage.objects;
create policy "Users can upload own workout photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'workout-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own workout photos" on storage.objects;
create policy "Users can update own workout photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'workout-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own workout photos" on storage.objects;
create policy "Users can delete own workout photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'workout-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ##############################################################################
-- 003 — Grades, board/outdoors bonuses, comments, kudos
-- ##############################################################################

alter table public.workout_logs
  add column if not exists is_moonboard boolean not null default false,
  add column if not exists is_outdoors boolean not null default false,
  add column if not exists hardest_grade text;

alter table public.workout_logs drop constraint if exists workout_logs_hardest_grade_check;
alter table public.workout_logs
  add constraint workout_logs_hardest_grade_check check (
    hardest_grade is null or hardest_grade in (
      '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+',
      '8A', '8A+', '8B', '8B+', '8C', '8C+', '9A'
    )
  );

create or replace function public.grade_bonus(p_grade text)
returns integer language sql immutable as $$
  select coalesce(case p_grade
    when '6B+' then 8 when '6C' then 12 when '6C+' then 16 when '7A' then 20
    when '7A+' then 24 when '7B' then 28 when '7B+' then 32 when '7C' then 36
    when '7C+' then 42 when '8A' then 48 when '8A+' then 54 when '8B' then 60
    when '8B+' then 68 when '8C' then 76 when '8C+' then 84 when '9A' then 100
    else 0 end, 0);
$$;

-- Point function updated again in 005 — interim version for 003-only installs
create or replace function public.calc_pump_points(
  p_duration_minutes integer,
  p_intensity_level integer,
  p_is_moonboard boolean default false,
  p_is_outdoors boolean default false,
  p_hardest_grade text default null
)
returns integer language sql immutable as $$
  select (
    round((p_duration_minutes::numeric / 30) * p_intensity_level * 10)
    + case when p_is_moonboard then 25 else 0 end
    + case when p_is_outdoors then 30 else 0 end
    + public.grade_bonus(p_hardest_grade)
  )::integer;
$$;

create or replace function public.enforce_workout_points()
returns trigger language plpgsql as $$
begin
  new.total_points := public.calc_pump_points(
    new.duration_minutes,
    new.intensity_level,
    coalesce(new.is_moonboard, false),
    coalesce(new.is_outdoors, false),
    new.hardest_grade
  );
  return new;
end;
$$;

create table if not exists public.session_comments (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists session_comments_workout_idx
  on public.session_comments (workout_log_id, created_at desc);

create table if not exists public.session_kudos (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint session_kudos_unique unique (workout_log_id, user_id)
);

create index if not exists session_kudos_workout_idx on public.session_kudos (workout_log_id);

alter table public.session_comments enable row level security;
alter table public.session_kudos enable row level security;

drop policy if exists "Comments viewable by authenticated users" on public.session_comments;
create policy "Comments viewable by authenticated users"
  on public.session_comments for select to authenticated using (true);

drop policy if exists "Users can insert comments" on public.session_comments;
create policy "Users can insert comments"
  on public.session_comments for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.session_comments;
create policy "Users can delete own comments"
  on public.session_comments for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Kudos viewable by authenticated users" on public.session_kudos;
create policy "Kudos viewable by authenticated users"
  on public.session_kudos for select to authenticated using (true);

drop policy if exists "Users can give kudos" on public.session_kudos;
create policy "Users can give kudos"
  on public.session_kudos for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can remove own kudos" on public.session_kudos;
create policy "Users can remove own kudos"
  on public.session_kudos for delete to authenticated using (auth.uid() = user_id);

-- ##############################################################################
-- 004 — Private crews
-- ##############################################################################

create table if not exists public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 40),
  invite_code text not null unique,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.crew_members (
  crew_id uuid not null references public.crews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id),
  constraint crew_members_one_crew_per_user unique (user_id)
);

create index if not exists crew_members_crew_id_idx on public.crew_members (crew_id);

create or replace function public.generate_invite_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.create_crew(p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_crew public.crews%rowtype;
  v_code text;
  v_attempts int := 0;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from public.crew_members where user_id = auth.uid()) then
    raise exception 'You are already in a crew. Leave first.';
  end if;
  loop
    v_code := public.generate_invite_code();
    exit when not exists (select 1 from public.crews where invite_code = v_code);
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then raise exception 'Could not generate invite code'; end if;
  end loop;
  insert into public.crews (name, invite_code, created_by)
  values (trim(p_name), v_code, auth.uid()) returning * into v_crew;
  insert into public.crew_members (crew_id, user_id, role)
  values (v_crew.id, auth.uid(), 'owner');
  return json_build_object(
    'id', v_crew.id, 'name', v_crew.name,
    'invite_code', v_crew.invite_code, 'role', 'owner'
  );
end;
$$;

create or replace function public.join_crew_by_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_crew public.crews%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from public.crew_members where user_id = auth.uid()) then
    raise exception 'You are already in a crew. Leave first.';
  end if;
  select * into v_crew from public.crews where invite_code = upper(trim(p_code));
  if not found then raise exception 'Invalid invite code'; end if;
  insert into public.crew_members (crew_id, user_id, role)
  values (v_crew.id, auth.uid(), 'member');
  return json_build_object(
    'id', v_crew.id, 'name', v_crew.name,
    'invite_code', v_crew.invite_code, 'role', 'member'
  );
end;
$$;

create or replace function public.leave_crew()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_crew_id uuid;
  v_role text;
  v_member_count int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select crew_id, role into v_crew_id, v_role from public.crew_members where user_id = auth.uid();
  if v_crew_id is null then raise exception 'Not in a crew'; end if;
  select count(*) into v_member_count from public.crew_members where crew_id = v_crew_id;
  if v_role = 'owner' and v_member_count > 1 then
    raise exception 'As owner, delete the crew instead of leaving while members remain.';
  end if;
  delete from public.crew_members where user_id = auth.uid();
  if v_role = 'owner' then delete from public.crews where id = v_crew_id; end if;
end;
$$;

create or replace function public.delete_crew()
returns void language plpgsql security definer set search_path = public as $$
declare v_crew_id uuid;
begin
  select crew_id into v_crew_id from public.crew_members
  where user_id = auth.uid() and role = 'owner';
  if v_crew_id is null then raise exception 'Only the crew owner can delete the crew'; end if;
  delete from public.crews where id = v_crew_id;
end;
$$;

create or replace function public.regenerate_invite_code()
returns text language plpgsql security definer set search_path = public as $$
declare
  v_crew_id uuid;
  v_code text;
  v_attempts int := 0;
begin
  select crew_id into v_crew_id from public.crew_members
  where user_id = auth.uid() and role = 'owner';
  if v_crew_id is null then raise exception 'Only the crew owner can regenerate the invite code'; end if;
  loop
    v_code := public.generate_invite_code();
    exit when not exists (
      select 1 from public.crews where invite_code = v_code and id <> v_crew_id
    );
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then raise exception 'Could not generate invite code'; end if;
  end loop;
  update public.crews set invite_code = v_code where id = v_crew_id;
  return v_code;
end;
$$;

alter table public.crews enable row level security;
alter table public.crew_members enable row level security;

drop policy if exists "Crews visible to members" on public.crews;
create policy "Crews visible to members" on public.crews for select to authenticated
  using (exists (
    select 1 from public.crew_members cm
    where cm.crew_id = crews.id and cm.user_id = auth.uid()
  ));

drop policy if exists "Crew members visible to same crew" on public.crew_members;
create policy "Crew members visible to same crew" on public.crew_members for select to authenticated
  using (crew_id in (select crew_id from public.crew_members where user_id = auth.uid()));

revoke insert, update, delete on public.crews from authenticated;
revoke insert, update, delete on public.crew_members from authenticated;

grant execute on function public.create_crew(text) to authenticated;
grant execute on function public.join_crew_by_code(text) to authenticated;
grant execute on function public.leave_crew() to authenticated;
grant execute on function public.delete_crew() to authenticated;
grant execute on function public.regenerate_invite_code() to authenticated;

-- ##############################################################################
-- 005 — Session types (climbing / hangboard / gym / stretching) + crew battles
-- ##############################################################################

alter table public.workout_logs
  add column if not exists session_type text not null default 'climbing';

alter table public.workout_logs drop constraint if exists workout_logs_session_type_check;
alter table public.workout_logs add constraint workout_logs_session_type_check check (
  session_type in ('climbing', 'hangboard', 'gym', 'stretching')
);

-- Allow negative points (stretching)
alter table public.workout_logs drop constraint if exists workout_logs_total_points_check;

create or replace function public.calc_pump_points(
  p_duration_minutes integer,
  p_intensity_level integer,
  p_session_type text default 'climbing',
  p_is_moonboard boolean default false,
  p_is_outdoors boolean default false,
  p_hardest_grade text default null
)
returns integer language plpgsql immutable as $$
declare base integer;
begin
  if p_session_type = 'stretching' then
    return -greatest(5, round((p_duration_minutes::numeric / 30) * p_intensity_level * 6)::integer);
  end if;
  base := round((p_duration_minutes::numeric / 30) * p_intensity_level * 10)::integer;
  if p_session_type = 'hangboard' then
    return base + 15;
  elsif p_session_type = 'gym' then
    return greatest(5, round(base * 0.75)::integer);
  elsif p_session_type = 'climbing' then
    return base
      + case when p_is_moonboard then 25 else 0 end
      + case when p_is_outdoors then 30 else 0 end
      + public.grade_bonus(p_hardest_grade);
  end if;
  return base;
end;
$$;

create or replace function public.enforce_workout_points()
returns trigger language plpgsql as $$
begin
  new.total_points := public.calc_pump_points(
    new.duration_minutes,
    new.intensity_level,
    coalesce(new.session_type, 'climbing'),
    case when coalesce(new.session_type, 'climbing') = 'climbing'
      then coalesce(new.is_moonboard, false) else false end,
    case when coalesce(new.session_type, 'climbing') = 'climbing'
      then coalesce(new.is_outdoors, false) else false end,
    case when coalesce(new.session_type, 'climbing') = 'climbing'
      then new.hardest_grade else null end
  );
  return new;
end;
$$;

create table if not exists public.crew_battles (
  id uuid primary key default gen_random_uuid(),
  challenger_crew_id uuid not null references public.crews (id) on delete cascade,
  opponent_crew_id uuid not null references public.crews (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'completed', 'declined')),
  duration_days integer not null default 7 check (duration_days between 1 and 30),
  starts_at timestamptz,
  ends_at timestamptz,
  winner_crew_id uuid references public.crews (id),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint crew_battles_different_crews check (challenger_crew_id <> opponent_crew_id)
);

create index if not exists crew_battles_challenger_idx on public.crew_battles (challenger_crew_id);
create index if not exists crew_battles_opponent_idx on public.crew_battles (opponent_crew_id);
create index if not exists crew_battles_status_idx on public.crew_battles (status);

create or replace function public.crew_battle_points(
  p_crew_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns integer language sql stable as $$
  select coalesce(sum(w.total_points), 0)::integer
  from public.workout_logs w
  inner join public.crew_members cm on cm.user_id = w.user_id
  where cm.crew_id = p_crew_id
    and w.created_at >= p_starts_at
    and w.created_at <= p_ends_at;
$$;

create or replace function public.compute_battle_scores(p_battle_id uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  b public.crew_battles%rowtype;
  challenger_pts int;
  opponent_pts int;
begin
  select * into b from public.crew_battles where id = p_battle_id;
  if not found then raise exception 'Battle not found'; end if;
  if b.status <> 'active' or b.starts_at is null or b.ends_at is null then
    return json_build_object('challenger_points', 0, 'opponent_points', 0, 'ends_at', b.ends_at);
  end if;
  challenger_pts := public.crew_battle_points(b.challenger_crew_id, b.starts_at, b.ends_at);
  opponent_pts := public.crew_battle_points(b.opponent_crew_id, b.starts_at, b.ends_at);
  return json_build_object(
    'challenger_points', challenger_pts,
    'opponent_points', opponent_pts,
    'ends_at', b.ends_at
  );
end;
$$;

create or replace function public.challenge_crew_battle(
  p_opponent_code text,
  p_duration_days integer default 7
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_my_crew_id uuid;
  v_opponent_crew public.crews%rowtype;
  v_battle public.crew_battles%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select cm.crew_id into v_my_crew_id from public.crew_members cm
  where cm.user_id = auth.uid() and cm.role = 'owner';
  if v_my_crew_id is null then raise exception 'Only the crew owner can declare battle'; end if;
  select * into v_opponent_crew from public.crews where invite_code = upper(trim(p_opponent_code));
  if not found then raise exception 'No crew found with that invite code'; end if;
  if v_opponent_crew.id = v_my_crew_id then raise exception 'Cannot battle your own crew'; end if;
  if exists (
    select 1 from public.crew_battles
    where status in ('pending', 'active')
      and (
        (challenger_crew_id = v_my_crew_id and opponent_crew_id = v_opponent_crew.id)
        or (challenger_crew_id = v_opponent_crew.id and opponent_crew_id = v_my_crew_id)
      )
  ) then
    raise exception 'A battle with this crew is already pending or active';
  end if;
  insert into public.crew_battles (
    challenger_crew_id, opponent_crew_id, status, duration_days, created_by
  )
  values (
    v_my_crew_id, v_opponent_crew.id, 'pending', coalesce(p_duration_days, 7), auth.uid()
  )
  returning * into v_battle;
  return json_build_object(
    'id', v_battle.id,
    'status', v_battle.status,
    'opponent_name', v_opponent_crew.name,
    'duration_days', v_battle.duration_days
  );
end;
$$;

create or replace function public.accept_crew_battle(p_battle_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_battle public.crew_battles%rowtype;
begin
  select * into v_battle from public.crew_battles where id = p_battle_id;
  if not found then raise exception 'Battle not found'; end if;
  if v_battle.status <> 'pending' then raise exception 'Battle is not pending'; end if;
  if not exists (
    select 1 from public.crew_members
    where crew_id = v_battle.opponent_crew_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the challenged crew owner can accept';
  end if;
  update public.crew_battles
  set status = 'active', starts_at = now(),
    ends_at = now() + (v_battle.duration_days || ' days')::interval
  where id = p_battle_id
  returning * into v_battle;
  return json_build_object(
    'id', v_battle.id, 'status', v_battle.status,
    'starts_at', v_battle.starts_at, 'ends_at', v_battle.ends_at
  );
end;
$$;

create or replace function public.decline_crew_battle(p_battle_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_battle public.crew_battles%rowtype;
begin
  select * into v_battle from public.crew_battles where id = p_battle_id;
  if not found then raise exception 'Battle not found'; end if;
  if not exists (
    select 1 from public.crew_members cm
    where cm.user_id = auth.uid() and cm.role = 'owner'
      and (cm.crew_id = v_battle.opponent_crew_id or cm.crew_id = v_battle.challenger_crew_id)
  ) then
    raise exception 'Only a crew owner involved in this battle can decline';
  end if;
  update public.crew_battles set status = 'declined' where id = p_battle_id;
end;
$$;

create or replace function public.finalize_expired_battles()
returns void language plpgsql security definer set search_path = public as $$
declare
  b record;
  c_pts int;
  o_pts int;
begin
  for b in
    select * from public.crew_battles where status = 'active' and ends_at < now()
  loop
    c_pts := public.crew_battle_points(b.challenger_crew_id, b.starts_at, b.ends_at);
    o_pts := public.crew_battle_points(b.opponent_crew_id, b.starts_at, b.ends_at);
    update public.crew_battles
    set
      status = 'completed',
      winner_crew_id = case
        when c_pts > o_pts then b.challenger_crew_id
        when o_pts > c_pts then b.opponent_crew_id
        else null
      end
    where id = b.id;
  end loop;
end;
$$;

alter table public.crew_battles enable row level security;

drop policy if exists "Battles visible to participating crews" on public.crew_battles;
create policy "Battles visible to participating crews"
  on public.crew_battles for select to authenticated
  using (
    challenger_crew_id in (select crew_id from public.crew_members where user_id = auth.uid())
    or opponent_crew_id in (select crew_id from public.crew_members where user_id = auth.uid())
  );

grant execute on function public.challenge_crew_battle(text, integer) to authenticated;
grant execute on function public.accept_crew_battle(uuid) to authenticated;
grant execute on function public.decline_crew_battle(uuid) to authenticated;
grant execute on function public.compute_battle_scores(uuid) to authenticated;
grant execute on function public.finalize_expired_battles() to authenticated;

-- =============================================================================
-- AFTER RUNNING — enable Realtime for NEW tables (Dashboard, not SQL):
--   session_comments, session_kudos, crew_battles
-- (workout_logs too if not already on)
-- =============================================================================
