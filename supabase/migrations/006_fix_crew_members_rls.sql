-- Fix: users could not read their own crew_members row after create_crew/join
-- (recursive RLS on "Crew members visible to same crew" subquery).

drop policy if exists "Users can view own crew membership" on public.crew_members;
create policy "Users can view own crew membership"
  on public.crew_members for select
  to authenticated
  using (user_id = auth.uid());
