-- Run this ENTIRE file once in Supabase SQL Editor if crew create/join "works"
-- but you stay stuck on "Create a crew / I have an invite code".

-- 1) RLS: you must be able to read your own crew_members row
drop policy if exists "Users can view own crew membership" on public.crew_members;
create policy "Users can view own crew membership"
  on public.crew_members for select
  to authenticated
  using (user_id = auth.uid());

-- 2) Allow multiple crews (drops old one-crew-per-user limit)
alter table public.crew_members
  drop constraint if exists crew_members_one_crew_per_user;

-- 3) create_crew / join_crew_by_code (no "already in a crew" block for other crews)
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

grant execute on function public.create_crew(text) to authenticated;
grant execute on function public.join_crew_by_code(text) to authenticated;

-- 4) Reliable crew list for the app (bypasses broken RLS reads)
create or replace function public.get_my_crew_memberships()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if auth.uid() is null then
    return '[]'::json;
  end if;

  select coalesce(
    json_agg(
      json_build_object(
        'crew', json_build_object(
          'id', c.id,
          'name', c.name,
          'invite_code', c.invite_code,
          'location', c.location,
          'banner_url', c.banner_url,
          'created_by', c.created_by,
          'created_at', c.created_at
        ),
        'role', cm.role,
        'members', (
          select coalesce(json_agg(
            json_build_object(
              'id', p.id,
              'username', p.username,
              'avatar_url', p.avatar_url,
              'title', p.title,
              'home_crag', p.home_crag,
              'current_pump_score', p.current_pump_score,
              'last_logged_at', p.last_logged_at
            )
            order by p.username
          ), '[]'::json)
          from public.crew_members cm2
          inner join public.profiles p on p.id = cm2.user_id
          where cm2.crew_id = c.id
        )
      )
      order by c.name
    ),
    '[]'::json
  )
  into v_result
  from public.crew_members cm
  inner join public.crews c on c.id = cm.crew_id
  where cm.user_id = auth.uid();

  return v_result;
end;
$$;

grant execute on function public.get_my_crew_memberships() to authenticated;
