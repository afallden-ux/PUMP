-- Private crews: invite-only groups (one crew per user)

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 40),
  invite_code text not null unique,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.crew_members (
  crew_id uuid not null references public.crews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id),
  constraint crew_members_one_crew_per_user unique (user_id)
);

create index crew_members_crew_id_idx on public.crew_members (crew_id);

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
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

-- -----------------------------------------------------------------------------
-- RPC: create crew (caller becomes owner)
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

  if exists (select 1 from public.crew_members where user_id = auth.uid()) then
    raise exception 'You are already in a crew. Leave first.';
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

-- -----------------------------------------------------------------------------
-- RPC: join crew by invite code
-- -----------------------------------------------------------------------------
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

  if exists (select 1 from public.crew_members where user_id = auth.uid()) then
    raise exception 'You are already in a crew. Leave first.';
  end if;

  select * into v_crew
  from public.crews
  where invite_code = upper(trim(p_code));

  if not found then
    raise exception 'Invalid invite code';
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
-- RPC: leave crew
-- -----------------------------------------------------------------------------
create or replace function public.leave_crew()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_crew_id uuid;
  v_role text;
  v_member_count int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select crew_id, role into v_crew_id, v_role
  from public.crew_members
  where user_id = auth.uid();

  if v_crew_id is null then
    raise exception 'Not in a crew';
  end if;

  select count(*) into v_member_count
  from public.crew_members
  where crew_id = v_crew_id;

  if v_role = 'owner' and v_member_count > 1 then
    raise exception 'Transfer ownership or remove members before leaving. As owner, you can delete the crew instead.';
  end if;

  delete from public.crew_members where user_id = auth.uid();

  if v_role = 'owner' then
    delete from public.crews where id = v_crew_id;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: delete crew (owner only)
-- -----------------------------------------------------------------------------
create or replace function public.delete_crew()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_crew_id uuid;
begin
  select crew_id into v_crew_id
  from public.crew_members
  where user_id = auth.uid() and role = 'owner';

  if v_crew_id is null then
    raise exception 'Only the crew owner can delete the crew';
  end if;

  delete from public.crews where id = v_crew_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: regenerate invite code (owner only)
-- -----------------------------------------------------------------------------
create or replace function public.regenerate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_crew_id uuid;
  v_code text;
  v_attempts int := 0;
begin
  select crew_id into v_crew_id
  from public.crew_members
  where user_id = auth.uid() and role = 'owner';

  if v_crew_id is null then
    raise exception 'Only the crew owner can regenerate the invite code';
  end if;

  loop
    v_code := public.generate_invite_code();
    exit when not exists (
      select 1 from public.crews where invite_code = v_code and id <> v_crew_id
    );
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then
      raise exception 'Could not generate invite code';
    end if;
  end loop;

  update public.crews set invite_code = v_code where id = v_crew_id;
  return v_code;
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.crews enable row level security;
alter table public.crew_members enable row level security;

create policy "Crews visible to members"
  on public.crews for select
  to authenticated
  using (
    exists (
      select 1 from public.crew_members cm
      where cm.crew_id = crews.id and cm.user_id = auth.uid()
    )
  );

create policy "Crew members visible to same crew"
  on public.crew_members for select
  to authenticated
  using (
    crew_id in (
      select crew_id from public.crew_members where user_id = auth.uid()
    )
  );

-- Writes only via security definer functions
revoke insert, update, delete on public.crews from authenticated;
revoke insert, update, delete on public.crew_members from authenticated;

grant execute on function public.create_crew(text) to authenticated;
grant execute on function public.join_crew_by_code(text) to authenticated;
grant execute on function public.leave_crew() to authenticated;
grant execute on function public.delete_crew() to authenticated;
grant execute on function public.regenerate_invite_code() to authenticated;
