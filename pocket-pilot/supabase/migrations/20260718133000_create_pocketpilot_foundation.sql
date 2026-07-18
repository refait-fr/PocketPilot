create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  time_zone text not null check (char_length(time_zone) between 1 and 64),
  created_at timestamptz not null default now()
);

create table public.recurring_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 100),
  amount_cents bigint not null check (amount_cents > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.recurring_fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 100),
  amount_cents bigint not null check (amount_cents > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  target_amount_cents bigint not null check (target_amount_cents > 0),
  current_amount_cents bigint not null default 0 check (
    current_amount_cents between 0 and target_amount_cents
  ),
  monthly_allocation_cents bigint not null default 0 check (
    monthly_allocation_cents >= 0
  ),
  created_at timestamptz not null default now()
);

create index recurring_incomes_user_id_idx
  on public.recurring_incomes (user_id);
create index recurring_fixed_expenses_user_id_idx
  on public.recurring_fixed_expenses (user_id);
create index savings_goals_user_id_idx
  on public.savings_goals (user_id);

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.recurring_incomes to authenticated;
grant select, insert, update, delete on table public.recurring_fixed_expenses to authenticated;
grant select, insert, update, delete on table public.savings_goals to authenticated;

alter table public.profiles enable row level security;
alter table public.recurring_incomes enable row level security;
alter table public.recurring_fixed_expenses enable row level security;
alter table public.savings_goals enable row level security;

create policy "profiles: users manage own rows"
  on public.profiles
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "recurring_incomes: users manage own rows"
  on public.recurring_incomes
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "recurring_fixed_expenses: users manage own rows"
  on public.recurring_fixed_expenses
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "savings_goals: users manage own rows"
  on public.savings_goals
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
