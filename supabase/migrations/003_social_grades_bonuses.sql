-- Grades, session bonuses, comments, kudos

-- -----------------------------------------------------------------------------
-- workout_logs: moonboard, outdoors, hardest grade (Font)
-- -----------------------------------------------------------------------------
alter table public.workout_logs
  add column if not exists is_moonboard boolean not null default false,
  add column if not exists is_outdoors boolean not null default false,
  add column if not exists hardest_grade text;

alter table public.workout_logs
  add constraint workout_logs_hardest_grade_check check (
    hardest_grade is null
    or hardest_grade in (
      '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+',
      '8A', '8A+', '8B', '8B+', '8C', '8C+', '9A'
    )
  );

-- -----------------------------------------------------------------------------
-- Point calculation (base + bonuses + grade)
-- -----------------------------------------------------------------------------
create or replace function public.grade_bonus(p_grade text)
returns integer
language sql
immutable
as $$
  select coalesce(
    case p_grade
      when '6B+' then 8
      when '6C' then 12
      when '6C+' then 16
      when '7A' then 20
      when '7A+' then 24
      when '7B' then 28
      when '7B+' then 32
      when '7C' then 36
      when '7C+' then 42
      when '8A' then 48
      when '8A+' then 54
      when '8B' then 60
      when '8B+' then 68
      when '8C' then 76
      when '8C+' then 84
      when '9A' then 100
      else 0
    end,
    0
  );
$$;

create or replace function public.calc_pump_points(
  p_duration_minutes integer,
  p_intensity_level integer,
  p_is_moonboard boolean default false,
  p_is_outdoors boolean default false,
  p_hardest_grade text default null
)
returns integer
language sql
immutable
as $$
  select (
    round((p_duration_minutes::numeric / 30) * p_intensity_level * 10)
    + case when p_is_moonboard then 25 else 0 end
    + case when p_is_outdoors then 30 else 0 end
    + public.grade_bonus(p_hardest_grade)
  )::integer;
$$;

create or replace function public.enforce_workout_points()
returns trigger
language plpgsql
as $$
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

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------
create table public.session_comments (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index session_comments_workout_idx on public.session_comments (workout_log_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Kudos / cudos
-- -----------------------------------------------------------------------------
create table public.session_kudos (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint session_kudos_unique unique (workout_log_id, user_id)
);

create index session_kudos_workout_idx on public.session_kudos (workout_log_id);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.session_comments enable row level security;
alter table public.session_kudos enable row level security;

create policy "Comments viewable by authenticated users"
  on public.session_comments for select to authenticated using (true);

create policy "Users can insert comments"
  on public.session_comments for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.session_comments for delete to authenticated
  using (auth.uid() = user_id);

create policy "Kudos viewable by authenticated users"
  on public.session_kudos for select to authenticated using (true);

create policy "Users can give kudos"
  on public.session_kudos for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove own kudos"
  on public.session_kudos for delete to authenticated
  using (auth.uid() = user_id);
