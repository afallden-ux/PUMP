-- Run in Supabase SQL Editor to allow deleting your own logged sessions.

create or replace function public.handle_workout_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    current_pump_score = greatest(0, current_pump_score - old.total_points),
    last_logged_at = (
      select max(w.created_at)
      from public.workout_logs w
      where w.user_id = old.user_id
    ),
    updated_at = now()
  where id = old.user_id;
  return old;
end;
$$;

drop trigger if exists on_workout_log_delete on public.workout_logs;
create trigger on_workout_log_delete
  after delete on public.workout_logs
  for each row execute function public.handle_workout_deleted();

drop policy if exists "Users can delete own workout logs" on public.workout_logs;
create policy "Users can delete own workout logs"
  on public.workout_logs for delete
  to authenticated
  using (auth.uid() = user_id);
