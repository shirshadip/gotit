alter table public.profiles
  add column if not exists email text,
  add column if not exists password_hash text,
  add column if not exists email_verified_at timestamptz,
  add column if not exists account_status text not null default 'active',
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_email_normalized_uidx
  on public.profiles (lower(email))
  where email is not null;

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_account_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_account_status_check
      check (account_status in ('active', 'disabled'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_email_normalized_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_email_normalized_check
      check (email is null or email = lower(btrim(email)));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_credentials_pair_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_credentials_pair_check
      check (
        (email is null and password_hash is null)
        or (email is not null and password_hash is not null)
      );
  end if;
end;
$migration$;

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
