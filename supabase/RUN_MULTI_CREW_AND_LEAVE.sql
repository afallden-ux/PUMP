-- Multiple crews per user; leave any crew; delete crew when last member leaves.

alter table public.crew_members
  drop constraint if exists crew_members_one_crew_per_user;

-- -----------------------------------------------------------------------------
-- create / join: allow multiple crews; block duplicate membership in same crew
-- -----------------------------------------------------------------------------
create or replace function public.create_crew(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_crew public.crews%rowtype;
  v_code text;
  v_attempts int := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  loop
    v_code := public.generate_invite_code();
    exit when not exists (select 1 from public.crews where invite_code = v_code);
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then
      raise exception 'Could not generate invite code';
    end if;
  end loop;

  insert into public.crews (name, invite_code, created_by)
  values (trim(p_name), v_code, auth.uid())
  returning * into v_crew;

  insert into public.crew_members (crew_id, user_id, role)
  values (v_crew.id, auth.uid(), 'owner');

  return json_build_object(
    'id', v_crew.id,
    'name', v_crew.name,
    'invite_code', v_crew.invite_code,
    'role', 'owner'
  );
end;
$$;

create or replace function public.join_crew_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_crew public.crews%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_crew
  from public.crews
  where invite_code = upper(trim(p_code));

  if not found then
    raise exception 'Invalid invite code';
  end if;

  if exists (
    select 1 from public.crew_members
    where crew_id = v_crew.id and user_id = auth.uid()
  ) then
    raise exception 'You are already in this crew';
  end if;

  insert into public.crew_members (crew_id, user_id, role)
  values (v_crew.id, auth.uid(), 'member');

  return json_build_object(
    'id', v_crew.id,
    'name', v_crew.name,
    'invite_code', v_crew.invite_code,
    'role', 'member'
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- leave crew: any member; transfer owner if needed; delete crew if empty
-- -----------------------------------------------------------------------------
create or replace function public.leave_crew(p_crew_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_member_count int;
  v_new_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select role into v_role
  from public.crew_members
  where crew_id = p_crew_id and user_id = auth.uid();

  if v_role is null then
    raise exception 'You are not in this crew';
  end if;

  delete from public.crew_members
  where crew_id = p_crew_id and user_id = auth.uid();

  select count(*) into v_member_count
  from public.crew_members
  where crew_id = p_crew_id;

  if v_member_count = 0 then
    delete from public.crews where id = p_crew_id;
    return;
  end if;

  if v_role = 'owner' then
    select user_id into v_new_owner
    from public.crew_members
    where crew_id = p_crew_id
    order by joined_at asc
    limit 1;

    update public.crew_members
    set role = 'owner'
    where crew_id = p_crew_id and user_id = v_new_owner;
  end if;
end;
$$;

-- Owner-only RPCs scoped to a crew the user owns
create or replace function public.delete_crew(p_crew_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.crew_members
    where crew_id = p_crew_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the crew owner can delete the crew';
  end if;

  delete from public.crews where id = p_crew_id;
end;
$$;

create or replace function public.regenerate_invite_code(p_crew_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_attempts int := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.crew_members
    where crew_id = p_crew_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the crew owner can regenerate the invite code';
  end if;

  loop
    v_code := public.generate_invite_code();
    exit when not exists (
      select 1 from public.crews where invite_code = v_code and id <> p_crew_id
    );
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then
      raise exception 'Could not generate invite code';
    end if;
  end loop;

  update public.crews set invite_code = v_code where id = p_crew_id;
  return v_code;
end;
$$;

create or replace function public.update_crew_location(p_crew_id uuid, p_location text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.crew_members
    where crew_id = p_crew_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the crew owner can set crew location';
  end if;

  update public.crews
  set location = nullif(trim(p_location), '')
  where id = p_crew_id;
end;
$$;

create or replace function public.update_crew_banner_url(p_crew_id uuid, p_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.crew_members
    where crew_id = p_crew_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the crew owner can set the crew banner';
  end if;

  update public.crews
  set banner_url = nullif(trim(p_url), '')
  where id = p_crew_id;
end;
$$;

-- Replace old zero-arg leave (if exists)
drop function if exists public.leave_crew();
drop function if exists public.delete_crew();
drop function if exists public.regenerate_invite_code();
drop function if exists public.update_crew_location(text);
drop function if exists public.update_crew_banner_url(text);

-- Battle challenges from a specific owned crew
drop function if exists public.challenge_crew_battle(text, integer);

create or replace function public.challenge_crew_battle(
  p_crew_id uuid,
  p_opponent_code text,
  p_duration_days integer default 7
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_opponent_crew public.crews%rowtype;
  v_battle public.crew_battles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.crew_members
    where crew_id = p_crew_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the crew owner can declare battle for this crew';
  end if;

  select * into v_opponent_crew
  from public.crews
  where invite_code = upper(trim(p_opponent_code));

  if not found then
    raise exception 'No crew found with that invite code';
  end if;

  if v_opponent_crew.id = p_crew_id then
    raise exception 'Cannot battle your own crew';
  end if;

  if exists (
    select 1 from public.crew_battles
    where status in ('pending', 'active')
      and (
        (challenger_crew_id = p_crew_id and opponent_crew_id = v_opponent_crew.id)
        or (challenger_crew_id = v_opponent_crew.id and opponent_crew_id = p_crew_id)
      )
  ) then
    raise exception 'A battle with this crew is already pending or active';
  end if;

  insert into public.crew_battles (
    challenger_crew_id, opponent_crew_id, status, duration_days, created_by
  )
  values (
    p_crew_id, v_opponent_crew.id, 'pending', coalesce(p_duration_days, 7), auth.uid()
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

grant execute on function public.challenge_crew_battle(uuid, text, integer) to authenticated;
grant execute on function public.leave_crew(uuid) to authenticated;
grant execute on function public.delete_crew(uuid) to authenticated;
grant execute on function public.regenerate_invite_code(uuid) to authenticated;
grant execute on function public.update_crew_location(uuid, text) to authenticated;
grant execute on function public.update_crew_banner_url(uuid, text) to authenticated;
