-- Crew banner, public directory RPCs (no invite codes leaked), banner update.

alter table public.crews
  add column if not exists banner_url text;

-- -----------------------------------------------------------------------------
-- Storage: crew banners
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('crew-banners', 'crew-banners', true)
on conflict (id) do nothing;

drop policy if exists "Crew banners are publicly accessible" on storage.objects;
create policy "Crew banners are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'crew-banners');

drop policy if exists "Crew owners can upload crew banner" on storage.objects;
create policy "Crew owners can upload crew banner"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'crew-banners'
    and exists (
      select 1 from public.crew_members cm
      where cm.crew_id::text = (storage.foldername(name))[1]
        and cm.user_id = auth.uid()
        and cm.role = 'owner'
    )
  );

drop policy if exists "Crew owners can update crew banner" on storage.objects;
create policy "Crew owners can update crew banner"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'crew-banners'
    and exists (
      select 1 from public.crew_members cm
      where cm.crew_id::text = (storage.foldername(name))[1]
        and cm.user_id = auth.uid()
        and cm.role = 'owner'
    )
  );

drop policy if exists "Crew owners can delete crew banner" on storage.objects;
create policy "Crew owners can delete crew banner"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'crew-banners'
    and exists (
      select 1 from public.crew_members cm
      where cm.crew_id::text = (storage.foldername(name))[1]
        and cm.user_id = auth.uid()
        and cm.role = 'owner'
    )
  );

-- -----------------------------------------------------------------------------
-- RPC: list all crews (directory — no invite codes)
-- -----------------------------------------------------------------------------
create or replace function public.list_public_crews()
returns table (
  id uuid,
  name text,
  location text,
  banner_url text,
  member_count bigint,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.location,
    c.banner_url,
    (select count(*)::bigint from public.crew_members cm where cm.crew_id = c.id) as member_count,
    c.created_at
  from public.crews c
  order by c.name asc;
$$;

-- -----------------------------------------------------------------------------
-- RPC: public crew profile (members + stats, no invite code)
-- -----------------------------------------------------------------------------
create or replace function public.get_public_crew_detail(p_crew_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_crew public.crews%rowtype;
  v_members json;
  v_count int;
begin
  select * into v_crew from public.crews where id = p_crew_id;
  if not found then
    raise exception 'Crew not found';
  end if;

  select
    coalesce(
      json_agg(
        json_build_object(
          'id', p.id,
          'username', p.username,
          'avatar_url', p.avatar_url,
          'title', p.title,
          'home_crag', p.home_crag,
          'current_pump_score', p.current_pump_score,
          'last_logged_at', p.last_logged_at,
          'role', cm.role
        )
        order by cm.role desc, p.username asc
      ),
      '[]'::json
    ),
    count(*)::int
  into v_members, v_count
  from public.crew_members cm
  inner join public.profiles p on p.id = cm.user_id
  where cm.crew_id = p_crew_id;

  return json_build_object(
    'id', v_crew.id,
    'name', v_crew.name,
    'location', v_crew.location,
    'banner_url', v_crew.banner_url,
    'created_at', v_crew.created_at,
    'member_count', v_count,
    'members', v_members
  );
end;
$$;

create or replace function public.update_crew_banner_url(p_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_crew_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select crew_id into v_crew_id
  from public.crew_members
  where user_id = auth.uid() and role = 'owner';

  if v_crew_id is null then
    raise exception 'Only the crew owner can set the crew banner';
  end if;

  update public.crews
  set banner_url = nullif(trim(p_url), '')
  where id = v_crew_id;
end;
$$;

grant execute on function public.list_public_crews() to authenticated;
grant execute on function public.get_public_crew_detail(uuid) to authenticated;
grant execute on function public.update_crew_banner_url(text) to authenticated;
