create table public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (
    category in (
      'Alimentation',
      'Transport',
      'Shopping',
      'Loisirs',
      'Abonnements',
      'Santé',
      'Études',
      'Autre'
    )
  ),
  monthly_budget_cents bigint not null check (
    monthly_budget_cents > 0
    and monthly_budget_cents <= 9007199254740991
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category)
);

create function public.set_category_budget_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_category_budget_updated_at() from public;

create trigger category_budgets_set_updated_at
before update on public.category_budgets
for each row execute function public.set_category_budget_updated_at();

grant select, insert, update, delete on table public.category_budgets
  to authenticated;

alter table public.category_budgets enable row level security;

create policy "category_budgets: users manage own rows"
  on public.category_budgets
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
