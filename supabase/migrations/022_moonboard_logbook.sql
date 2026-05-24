-- MoonBoard logbook chart (grade × tries) — manual / screenshot workflow

create table if not exists public.moonboard_logbook_meta (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  total_entries int,
  total_problems int,
  screenshot_url text,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.moonboard_logbook_meta enable row level security;

drop policy if exists "Users manage own moonboard logbook meta" on public.moonboard_logbook_meta;
create policy "Users manage own moonboard logbook meta"
  on public.moonboard_logbook_meta for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read all moonboard logbook meta" on public.moonboard_logbook_meta;
create policy "Users read all moonboard logbook meta"
  on public.moonboard_logbook_meta for select to authenticated using (true);

create table if not exists public.moonboard_logbook_stats (
  user_id uuid not null references public.profiles (id) on delete cascade,
  grade text not null,
  flashed int not null default 0 check (flashed >= 0),
  second_try int not null default 0 check (second_try >= 0),
  third_try int not null default 0 check (third_try >= 0),
  more_tries int not null default 0 check (more_tries >= 0),
  total int not null default 0 check (total >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, grade)
);

create index if not exists moonboard_logbook_stats_user_idx
  on public.moonboard_logbook_stats (user_id);

alter table public.moonboard_logbook_stats enable row level security;

drop policy if exists "Users read all moonboard logbook stats" on public.moonboard_logbook_stats;
create policy "Users read all moonboard logbook stats"
  on public.moonboard_logbook_stats for select to authenticated using (true);

drop policy if exists "Users manage own moonboard logbook stats" on public.moonboard_logbook_stats;
create policy "Users manage own moonboard logbook stats"
  on public.moonboard_logbook_stats for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own moonboard logbook stats" on public.moonboard_logbook_stats;
create policy "Users delete own moonboard logbook stats"
  on public.moonboard_logbook_stats for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own moonboard logbook stats" on public.moonboard_logbook_stats;
create policy "Users update own moonboard logbook stats"
  on public.moonboard_logbook_stats for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
