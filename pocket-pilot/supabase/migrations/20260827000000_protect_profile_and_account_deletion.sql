create function public.prevent_currency_change_with_financial_data()
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

create trigger profiles_prevent_currency_change_with_financial_data
before update of currency_code on public.profiles
for each row execute function public.prevent_currency_change_with_financial_data();

create function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  delete from auth.users where id = current_user_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'authenticated_user_not_found';
  end if;
end;
$$;

revoke all on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user() to authenticated;

-- The E2E fixture verifies account-deletion cascades through a Node-only
-- service-role client. RLS bypass does not replace PostgreSQL table privileges.
grant select on table
  public.profiles,
  public.recurring_incomes,
  public.recurring_fixed_expenses,
  public.savings_goals,
  public.transactions,
  public.category_budgets
to service_role;
