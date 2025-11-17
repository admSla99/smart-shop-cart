-- Enable pgcrypto for gen_random_uuid
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  display_name text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  name text not null,
  quantity text,
  notes text,
  is_checked boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.list_items enable row level security;

create policy "Users can select their profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users manage their lists"
on public.shopping_lists
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage items in their lists"
on public.list_items
for all
using (
  list_id in (
    select id from public.shopping_lists where user_id = auth.uid()
  )
)
with check (
  list_id in (
    select id from public.shopping_lists where user_id = auth.uid()
  )
);
