-- Session photos on workout logs + storage bucket

alter table public.workout_logs
  add column if not exists photo_url text;

-- Users can update own logs (e.g. attach photo after insert)
create policy "Users can update own workout logs"
  on public.workout_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage: session photos
insert into storage.buckets (id, name, public)
values ('workout-photos', 'workout-photos', true)
on conflict (id) do nothing;

create policy "Workout photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'workout-photos');

create policy "Users can upload own workout photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'workout-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own workout photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own workout photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
