create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;