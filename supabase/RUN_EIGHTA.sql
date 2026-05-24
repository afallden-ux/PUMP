-- Run in Supabase SQL Editor (paste file contents, not the filename)

create table if not exists public.eighta_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  profile_slug text not null,
  login_username text not null,
  session_cookies text not null default '',
  last_sync_at timestamptz,
  last_sync_status text not null default 'never',
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eighta_ascents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  external_key text not null,
  category text not null,
  climb_name text not null,
  climbed_at date not null,
  grade_display text,
  ascent_style text,
  crag_name text,
  area_name text,
  comment text,
  rating smallint,
  created_at timestamptz not null default now(),
  unique (user_id, external_key)
);

create index if not exists eighta_ascents_user_climbed_idx
  on public.eighta_ascents (user_id, climbed_at desc);

alter table public.eighta_connections enable row level security;
alter table public.eighta_ascents enable row level security;

drop policy if exists "Users manage own eighta connection" on public.eighta_connections;
create policy "Users manage own eighta connection"
  on public.eighta_connections for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read all eighta ascents" on public.eighta_ascents;
create policy "Users read all eighta ascents"
  on public.eighta_ascents for select to authenticated using (true);

drop policy if exists "Users manage own eighta ascents" on public.eighta_ascents;
create policy "Users manage own eighta ascents"
  on public.eighta_ascents for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own eighta ascents" on public.eighta_ascents;
create policy "Users delete own eighta ascents"
  on public.eighta_ascents for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own eighta ascents" on public.eighta_ascents;
create policy "Users update own eighta ascents"
  on public.eighta_ascents for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
