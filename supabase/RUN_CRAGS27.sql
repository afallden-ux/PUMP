-- Run in Supabase SQL Editor (paste file contents, not the filename)

create table if not exists public.crags27_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  login_username text not null,
  profile_slug text not null,
  session_cookies text not null,
  last_sync_at timestamptz,
  last_sync_status text not null default 'never',
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crags27_ascents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  external_key text not null,
  climb_name text not null,
  climbed_at date not null,
  grade_display text,
  ascent_style text,
  crag_name text,
  route_type text,
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, external_key)
);

create index if not exists crags27_ascents_user_climbed_idx
  on public.crags27_ascents (user_id, climbed_at desc);

alter table public.crags27_connections enable row level security;
alter table public.crags27_ascents enable row level security;

drop policy if exists "Users manage own crags27 connection" on public.crags27_connections;
create policy "Users manage own crags27 connection"
  on public.crags27_connections for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read all crags27 ascents" on public.crags27_ascents;
create policy "Users read all crags27 ascents"
  on public.crags27_ascents for select to authenticated using (true);

drop policy if exists "Users manage own crags27 ascents" on public.crags27_ascents;
create policy "Users manage own crags27 ascents"
  on public.crags27_ascents for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own crags27 ascents" on public.crags27_ascents;
create policy "Users delete own crags27 ascents"
  on public.crags27_ascents for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own crags27 ascents" on public.crags27_ascents;
create policy "Users update own crags27 ascents"
  on public.crags27_ascents for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ascent tree (grade × flash / redpoint) — primary 27crags sync target
create table if not exists public.crags27_ascent_tree (
  user_id uuid not null references public.profiles (id) on delete cascade,
  grade text not null,
  total int not null default 0 check (total >= 0),
  onsight int not null default 0 check (onsight >= 0),
  flash int not null default 0 check (flash >= 0),
  redpoint int not null default 0 check (redpoint >= 0),
  toprope int not null default 0 check (toprope >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, grade)
);

create index if not exists crags27_ascent_tree_user_idx
  on public.crags27_ascent_tree (user_id);

alter table public.crags27_ascent_tree enable row level security;

drop policy if exists "Users read all crags27 ascent tree" on public.crags27_ascent_tree;
create policy "Users read all crags27 ascent tree"
  on public.crags27_ascent_tree for select to authenticated using (true);

drop policy if exists "Users manage own crags27 ascent tree" on public.crags27_ascent_tree;
create policy "Users manage own crags27 ascent tree"
  on public.crags27_ascent_tree for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own crags27 ascent tree" on public.crags27_ascent_tree;
create policy "Users delete own crags27 ascent tree"
  on public.crags27_ascent_tree for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own crags27 ascent tree" on public.crags27_ascent_tree;
create policy "Users update own crags27 ascent tree"
  on public.crags27_ascent_tree for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
