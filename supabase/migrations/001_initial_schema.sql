-- PUMP — initial schema, storage, RLS, triggers
-- Run in Supabase SQL Editor or: supabase db push

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  title text default 'Fresh Chalk',
  current_pump_score integer not null default 0 check (current_pump_score >= 0),
  last_logged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 2 and 32),
  constraint profiles_username_unique unique (username)
);

create index profiles_last_logged_at_idx on public.profiles (last_logged_at);
create index profiles_pump_score_idx on public.profiles (current_pump_score desc);

-- -----------------------------------------------------------------------------
-- workout_logs
-- -----------------------------------------------------------------------------
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  duration_minutes integer not null
    check (duration_minutes between 30 and 240),
  intensity_level integer not null
    check (intensity_level between 1 and 5),
  total_points integer not null check (total_points >= 0),
  created_at timestamptz not null default now()
);

create index workout_logs_user_id_idx on public.workout_logs (user_id);
create index workout_logs_created_at_idx on public.workout_logs (created_at desc);
create index workout_logs_user_created_idx on public.workout_logs (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Point calculation
-- -----------------------------------------------------------------------------
create or replace function public.calc_pump_points(
  p_duration_minutes integer,
  p_intensity_level integer
)
returns integer
language sql
immutable
as $$
  select round((p_duration_minutes::numeric / 30) * p_intensity_level * 10)::integer;
$$;

-- -----------------------------------------------------------------------------
-- Auto-create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- After workout: bump lifetime pump score + last_logged_at
-- -----------------------------------------------------------------------------
create or replace function public.handle_workout_logged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    current_pump_score = current_pump_score + new.total_points,
    last_logged_at = new.created_at,
    updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

create trigger on_workout_log_insert
  after insert on public.workout_logs
  for each row execute function public.handle_workout_logged();

create or replace function public.enforce_workout_points()
returns trigger
language plpgsql
as $$
declare
  expected integer;
begin
  expected := public.calc_pump_points(new.duration_minutes, new.intensity_level);
  new.total_points := expected;
  return new;
end;
$$;

create trigger workout_logs_points_before_insert
  before insert on public.workout_logs
  for each row execute function public.enforce_workout_points();

-- -----------------------------------------------------------------------------
-- 7-day leaderboard view
-- -----------------------------------------------------------------------------
create or replace view public.leaderboard_7d as
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

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.workout_logs enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Workout logs viewable by authenticated users"
  on public.workout_logs for select
  to authenticated
  using (true);

create policy "Users can insert own workout logs"
  on public.workout_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Storage: avatars
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Enable Realtime: Dashboard → Database → Replication → workout_logs
