-- JavaScript financial calculations are exact only through Number.MAX_SAFE_INTEGER.
-- Keep this value aligned with the TypeScript monetary parsers.
alter table public.recurring_incomes
  add constraint recurring_incomes_amount_cents_safe_integer
  check (amount_cents <= 9007199254740991);

alter table public.recurring_fixed_expenses
  add constraint recurring_fixed_expenses_amount_cents_safe_integer
  check (amount_cents <= 9007199254740991);

alter table public.savings_goals
  add constraint savings_goals_target_amount_cents_safe_integer
  check (target_amount_cents <= 9007199254740991),
  add constraint savings_goals_current_amount_cents_safe_integer
  check (current_amount_cents <= 9007199254740991),
  add constraint savings_goals_monthly_allocation_cents_safe_integer
  check (monthly_allocation_cents <= 9007199254740991);

-- PocketPilot is single-currency and only exposes this maintained product set.
alter table public.profiles
  add constraint profiles_currency_code_supported
  check (currency_code in ('EUR', 'CHF', 'GBP', 'USD', 'CAD', 'MAD', 'DZD'));

-- pg_timezone_names is PostgreSQL's native catalog of accepted time-zone names.
create function public.is_valid_time_zone(value text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = value
  );
$$;

comment on function public.is_valid_time_zone(text) is
  'Checks profile time zones against PostgreSQL pg_timezone_names.';

revoke all on function public.is_valid_time_zone(text) from public;
grant execute on function public.is_valid_time_zone(text) to authenticated;

alter table public.profiles
  add constraint profiles_time_zone_recognized
  check (public.is_valid_time_zone(time_zone));
