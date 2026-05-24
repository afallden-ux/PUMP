-- Run in Supabase SQL Editor (paste file contents, not the filename)

create table if not exists public.moonboard_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  moon_username text not null,
  session_cookies text not null,
  last_sync_at timestamptz,
  last_sync_status text not null default 'never',
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moonboard_ascents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  external_key text not null,
  board_key text not null,
  angle integer,
  climb_name text not null,
  climbed_at date not null,
  grade_display text,
  grade_logged text,
  tries text,
  is_benchmark boolean not null default false,
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, external_key)
);

create index if not exists moonboard_ascents_user_climbed_idx
  on public.moonboard_ascents (user_id, climbed_at desc);

alter table public.moonboard_connections enable row level security;
alter table public.moonboard_ascents enable row level security;

drop policy if exists "Users manage own moonboard connection" on public.moonboard_connections;
create policy "Users manage own moonboard connection"
  on public.moonboard_connections for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read all moonboard ascents" on public.moonboard_ascents;
create policy "Users read all moonboard ascents"
  on public.moonboard_ascents for select to authenticated using (true);

drop policy if exists "Users manage own moonboard ascents" on public.moonboard_ascents;
create policy "Users manage own moonboard ascents"
  on public.moonboard_ascents for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own moonboard ascents" on public.moonboard_ascents;
create policy "Users delete own moonboard ascents"
  on public.moonboard_ascents for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own moonboard ascents" on public.moonboard_ascents;
create policy "Users update own moonboard ascents"
  on public.moonboard_ascents for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
