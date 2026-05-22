-- Session types (climbing, hangboard, gym, stretching) + crew vs crew battles

-- -----------------------------------------------------------------------------
-- Session type on workout_logs
-- -----------------------------------------------------------------------------
alter table public.workout_logs
  add column if not exists session_type text not null default 'climbing';

alter table public.workout_logs
  drop constraint if exists workout_logs_session_type_check;

alter table public.workout_logs
  add constraint workout_logs_session_type_check check (
    session_type in ('climbing', 'hangboard', 'gym', 'stretching')
  );

-- Climbing bonuses only apply when session_type = climbing
create or replace function public.calc_pump_points(
  p_duration_minutes integer,
  p_intensity_level integer,
  p_session_type text default 'climbing',
  p_is_moonboard boolean default false,
  p_is_outdoors boolean default false,
  p_hardest_grade text default null
)
returns integer
language plpgsql
immutable
as $$
declare
  base integer;
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
returns trigger
language plpgsql
as $$
begin
  new.total_points := public.calc_pump_points(
    new.duration_minutes,
    new.intensity_level,
    coalesce(new.session_type, 'climbing'),
    case when coalesce(new.session_type, 'climbing') = 'climbing' then coalesce(new.is_moonboard, false) else false end,
    case when coalesce(new.session_type, 'climbing') = 'climbing' then coalesce(new.is_outdoors, false) else false end,
    case when coalesce(new.session_type, 'climbing') = 'climbing' then new.hardest_grade else null end
  );
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Crew battles
-- -----------------------------------------------------------------------------
create table public.crew_battles (
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

create index crew_battles_challenger_idx on public.crew_battles (challenger_crew_id);
create index crew_battles_opponent_idx on public.crew_battles (opponent_crew_id);
create index crew_battles_status_idx on public.crew_battles (status);

-- Sum battle points for a crew in an active window
create or replace function public.crew_battle_points(
  p_crew_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns integer
language sql
stable
as $$
  select coalesce(sum(w.total_points), 0)::integer
  from public.workout_logs w
  inner join public.crew_members cm on cm.user_id = w.user_id
  where cm.crew_id = p_crew_id
    and w.created_at >= p_starts_at
    and w.created_at <= p_ends_at;
$$;

create or replace function public.compute_battle_scores(p_battle_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  b public.crew_battles%rowtype;
  challenger_pts int;
  opponent_pts int;
begin
  select * into b from public.crew_battles where id = p_battle_id;
  if not found then
    raise exception 'Battle not found';
  end if;

  if b.status <> 'active' or b.starts_at is null or b.ends_at is null then
    return json_build_object(
      'challenger_points', 0,
      'opponent_points', 0,
      'ends_at', b.ends_at
    );
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

-- Challenge another crew by their invite code (challenger owner only)
create or replace function public.challenge_crew_battle(
  p_opponent_code text,
  p_duration_days integer default 7
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_my_crew_id uuid;
  v_opponent_crew public.crews%rowtype;
  v_battle public.crew_battles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select cm.crew_id into v_my_crew_id
  from public.crew_members cm
  where cm.user_id = auth.uid() and cm.role = 'owner';

  if v_my_crew_id is null then
    raise exception 'Only the crew owner can declare battle';
  end if;

  select * into v_opponent_crew
  from public.crews
  where invite_code = upper(trim(p_opponent_code));

  if not found then
    raise exception 'No crew found with that invite code';
  end if;

  if v_opponent_crew.id = v_my_crew_id then
    raise exception 'Cannot battle your own crew';
  end if;

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
    challenger_crew_id,
    opponent_crew_id,
    status,
    duration_days,
    created_by
  )
  values (
    v_my_crew_id,
    v_opponent_crew.id,
    'pending',
    coalesce(p_duration_days, 7),
    auth.uid()
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
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_battle public.crew_battles%rowtype;
begin
  select * into v_battle from public.crew_battles where id = p_battle_id;

  if not found then
    raise exception 'Battle not found';
  end if;

  if v_battle.status <> 'pending' then
    raise exception 'Battle is not pending';
  end if;

  if not exists (
    select 1 from public.crew_members
    where crew_id = v_battle.opponent_crew_id
      and user_id = auth.uid()
      and role = 'owner'
  ) then
    raise exception 'Only the challenged crew owner can accept';
  end if;

  update public.crew_battles
  set
    status = 'active',
    starts_at = now(),
    ends_at = now() + (v_battle.duration_days || ' days')::interval
  where id = p_battle_id
  returning * into v_battle;

  return json_build_object(
    'id', v_battle.id,
    'status', v_battle.status,
    'starts_at', v_battle.starts_at,
    'ends_at', v_battle.ends_at
  );
end;
$$;

create or replace function public.decline_crew_battle(p_battle_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_battle public.crew_battles%rowtype;
begin
  select * into v_battle from public.crew_battles where id = p_battle_id;

  if not found then
    raise exception 'Battle not found';
  end if;

  if not exists (
    select 1 from public.crew_members cm
    where cm.user_id = auth.uid()
      and cm.role = 'owner'
      and (cm.crew_id = v_battle.opponent_crew_id or cm.crew_id = v_battle.challenger_crew_id)
  ) then
    raise exception 'Only a crew owner involved in this battle can decline';
  end if;

  update public.crew_battles set status = 'declined' where id = p_battle_id;
end;
$$;

-- Finalize battles past end date (call from client or cron)
create or replace function public.finalize_expired_battles()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  c_pts int;
  o_pts int;
begin
  for b in
    select * from public.crew_battles
    where status = 'active' and ends_at < now()
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

-- -----------------------------------------------------------------------------
-- RLS crew_battles
-- -----------------------------------------------------------------------------
alter table public.crew_battles enable row level security;

create policy "Battles visible to participating crews"
  on public.crew_battles for select
  to authenticated
  using (
    challenger_crew_id in (select crew_id from public.crew_members where user_id = auth.uid())
    or opponent_crew_id in (select crew_id from public.crew_members where user_id = auth.uid())
  );

grant execute on function public.challenge_crew_battle(text, integer) to authenticated;
grant execute on function public.accept_crew_battle(uuid) to authenticated;
grant execute on function public.decline_crew_battle(uuid) to authenticated;
grant execute on function public.compute_battle_scores(uuid) to authenticated;
grant execute on function public.finalize_expired_battles() to authenticated;
