-- Les charges et revenus récurrents peuvent débuter dans le futur
-- (ex. abonnement prélevé à partir d'une date donnée) : ils n'entrent dans
-- le calcul mensuel qu'une fois débutés. La valeur par défaut remplit les
-- lignes existantes au jour de la migration ; seuls les mois à venir sont
-- calculés par l'application.
alter table public.recurring_incomes
  add column start_date date not null default CURRENT_DATE;

alter table public.recurring_fixed_expenses
  add column start_date date not null default CURRENT_DATE;

-- Revenus ponctuels (ex. dépôt d'espèces) : contrairement aux transactions
-- qui sont des sorties, ces entrées alimentent le revenu du mois de leur date.
create table public.one_time_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 100),
  amount_cents bigint not null check (
    amount_cents > 0 and amount_cents <= 9007199254740991
  ),
  income_date date not null,
  created_at timestamptz not null default now()
);

create index one_time_incomes_user_date_idx
  on public.one_time_incomes (user_id, income_date desc, created_at desc);

grant select, insert, update, delete on table public.one_time_incomes to authenticated;

alter table public.one_time_incomes enable row level security;

create policy "one_time_incomes: users manage own rows"
  on public.one_time_incomes
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Le verrou devise couvre aussi les revenus ponctuels.
create or replace function public.prevent_currency_change_with_financial_data()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.currency_code is distinct from old.currency_code
    and (
      exists (select 1 from public.recurring_incomes where user_id = old.user_id)
      or exists (select 1 from public.recurring_fixed_expenses where user_id = old.user_id)
      or exists (select 1 from public.savings_goals where user_id = old.user_id)
      or exists (select 1 from public.transactions where user_id = old.user_id)
      or exists (select 1 from public.one_time_incomes where user_id = old.user_id)
      or exists (select 1 from public.category_budgets where user_id = old.user_id)
    )
  then
    raise exception using
      errcode = '23514',
      message = 'currency_change_requires_empty_financial_data';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_currency_change_with_financial_data()
  from public, anon, authenticated;

grant select on table
  public.one_time_incomes
to service_role;
