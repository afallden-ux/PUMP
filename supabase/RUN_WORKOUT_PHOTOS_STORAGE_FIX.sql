-- Workout photo uploads (bucket + DB column + storage policies)
-- Run in Supabase SQL Editor. Bucket can already exist — still run this.
--
-- If you see "database schema is invalid or incompatible" WITH a bucket already:
--   That is usually NOT a missing bucket — check Table Editor → storage → objects
--   for a "level" column. If missing, contact Supabase support (Storage schema upgrade).

-- 2) workout_logs column + update policy
alter table public.workout_logs
  add column if not exists photo_url text;

drop policy if exists "Users can update own workout logs" on public.workout_logs;
create policy "Users can update own workout logs"
  on public.workout_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3) Bucket (if you already created it in the UI, this just ensures public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workout-photos',
  'workout-photos',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 4) Storage policies (path: {user_id}/{workout_id}.jpg)
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
    and auth.role() = 'authenticated'
    and name like (auth.uid()::text || '/%')
  );

drop policy if exists "Users can update own workout photos" on storage.objects;
create policy "Users can update own workout photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and name like (auth.uid()::text || '/%')
  )
  with check (
    bucket_id = 'workout-photos'
    and name like (auth.uid()::text || '/%')
  );

drop policy if exists "Users can delete own workout photos" on storage.objects;
create policy "Users can delete own workout photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and name like (auth.uid()::text || '/%')
  );
