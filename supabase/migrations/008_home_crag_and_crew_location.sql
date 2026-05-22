-- Home crag on profile; crew location (gym/crag) for the squad.

alter table public.profiles
  add column if not exists home_crag text;

alter table public.crews
  add column if not exists location text;

comment on column public.profiles.home_crag is 'User home crag / gym';
comment on column public.crews.location is 'Crew default crag or gym';

create or replace function public.update_crew_location(p_location text)
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
    raise exception 'Only the crew owner can set crew location';
  end if;

  update public.crews
  set location = nullif(trim(p_location), '')
  where id = v_crew_id;
end;
$$;

grant execute on function public.update_crew_location(text) to authenticated;
