-- Primary assessments (Lattice-style baseline tests)

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
  body_weight_kg numeric check (body_weight_kg is null or (body_weight_kg > 0 and body_weight_kg <= 300)),
  resistance_kg numeric check (resistance_kg is null or (resistance_kg >= 0 and resistance_kg <= 300)),
  time_under_tension_s integer check (time_under_tension_s is null or (time_under_tension_s >= 0 and time_under_tension_s <= 86400)),
  total_duration_s integer check (total_duration_s is null or (total_duration_s >= 0 and total_duration_s <= 86400)),
  distance_cm numeric check (distance_cm is null or (distance_cm >= 0 and distance_cm <= 300)),
  sets integer check (sets is null or (sets >= 0 and sets <= 100)),
  reps integer check (reps is null or (reps >= 0 and reps <= 100)),
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
