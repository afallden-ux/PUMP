-- Run in Supabase SQL Editor: height + weight / hang / pull-up tracking

alter table public.profiles
  add column if not exists height_cm numeric check (
    height_cm is null or (height_cm >= 100 and height_cm <= 250)
  );

create table if not exists public.body_metric_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  metric_type text not null check (metric_type in ('weight', 'max_hang', 'max_pullup')),
  value_kg numeric not null check (value_kg > 0 and value_kg <= 500),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists body_metric_logs_user_type_idx
  on public.body_metric_logs (user_id, metric_type, recorded_at desc);

alter table public.body_metric_logs enable row level security;

drop policy if exists "Users can read all body metrics" on public.body_metric_logs;
create policy "Users can read all body metrics"
  on public.body_metric_logs for select to authenticated using (true);

drop policy if exists "Users can insert own body metrics" on public.body_metric_logs;
create policy "Users can insert own body metrics"
  on public.body_metric_logs for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can delete own body metrics" on public.body_metric_logs;
create policy "Users can delete own body metrics"
  on public.body_metric_logs for delete
  to authenticated using (auth.uid() = user_id);
