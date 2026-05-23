-- Run if session photos or notes don't show on the feed.

-- Photo URL on logs + allow updating after upload
alter table public.workout_logs
  add column if not exists photo_url text;

drop policy if exists "Users can update own workout logs" on public.workout_logs;
create policy "Users can update own workout logs"
  on public.workout_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Session notes
alter table public.workout_logs
  add column if not exists notes text;

alter table public.workout_logs
  drop constraint if exists workout_logs_notes_length;

alter table public.workout_logs
  add constraint workout_logs_notes_length check (
    notes is null or char_length(trim(notes)) between 1 and 280
  );

-- Storage bucket (public read)
insert into storage.buckets (id, name, public)
values ('workout-photos', 'workout-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Workout photos are publicly accessible" on storage.objects;
create policy "Workout photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'workout-photos');

drop policy if exists "Users can upload own workout photos" on storage.objects;
create policy "Users can upload own workout photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'workout-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own workout photos" on storage.objects;
create policy "Users can update own workout photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
