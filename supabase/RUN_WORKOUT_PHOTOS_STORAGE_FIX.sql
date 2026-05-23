-- Fix "Photo upload failed — database schema is invalid or incompatible"
-- Run in Supabase SQL Editor AFTER creating the bucket in the dashboard (step 1).

-- 1) In Supabase Dashboard: Storage → New bucket
--    Name: workout-photos
--    Public bucket: ON
--    (Then run this script.)

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
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
    and (split_part(name, '/', 1) = (select auth.uid()::text))
  );

drop policy if exists "Users can update own workout photos" on storage.objects;
create policy "Users can update own workout photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and (split_part(name, '/', 1) = (select auth.uid()::text))
  )
  with check (
    bucket_id = 'workout-photos'
    and (split_part(name, '/', 1) = (select auth.uid()::text))
  );

drop policy if exists "Users can delete own workout photos" on storage.objects;
create policy "Users can delete own workout photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workout-photos'
    and (split_part(name, '/', 1) = (select auth.uid()::text))
  );
