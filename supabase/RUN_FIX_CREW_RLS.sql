-- Run once in Supabase SQL Editor if create/join crew succeeds but dashboard stays empty.
-- Fixes circular RLS on crew_members (cannot read your own row after create_crew).

drop policy if exists "Users can view own crew membership" on public.crew_members;
create policy "Users can view own crew membership"
  on public.crew_members for select
  to authenticated
  using (user_id = auth.uid());
