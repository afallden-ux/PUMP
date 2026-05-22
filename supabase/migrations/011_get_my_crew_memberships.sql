-- Reliable fetch of all crews for the current user (bypasses RLS edge cases on reads).

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
