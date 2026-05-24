-- Run in Supabase SQL Editor: primary assessment logs

create table if not exists public.assessment_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  assessment_type text not null check (
    assessment_type in (
      'finger_strength',
      'power_endurance',
      'weighted_pullup',
      'hip_flexibility'
    )
  ),
  recorded_at timestamptz not null default now(),
  body_weight_kg numeric,
  resistance_kg numeric,
  time_under_tension_s integer,
  total_duration_s integer,
  distance_cm numeric,
  sets integer,
  reps integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists assessment_logs_user_type_idx
  on public.assessment_logs (user_id, assessment_type, recorded_at desc);

alter table public.assessment_logs enable row level security;

drop policy if exists "Users can read all assessment logs" on public.assessment_logs;
create policy "Users can read all assessment logs"
  on public.assessment_logs for select to authenticated using (true);

drop policy if exists "Users can insert own assessment logs" on public.assessment_logs;
create policy "Users can insert own assessment logs"
  on public.assessment_logs for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can delete own assessment logs" on public.assessment_logs;
create policy "Users can delete own assessment logs"
  on public.assessment_logs for delete
  to authenticated using (auth.uid() = user_id);
