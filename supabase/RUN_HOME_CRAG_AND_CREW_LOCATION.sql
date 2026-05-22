-- Run once in Supabase SQL Editor

alter table public.profiles
  add column if not exists home_crag text;

alter table public.crews
  add column if not exists location text;

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
