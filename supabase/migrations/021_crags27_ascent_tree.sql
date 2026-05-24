-- 27crags ascent tree (grade distribution) — replaces per-tick sync for CC

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
