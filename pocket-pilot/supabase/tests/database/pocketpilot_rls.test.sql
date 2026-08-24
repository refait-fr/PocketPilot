begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(19);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'pocketpilot-a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'pocketpilot-b@example.test');

insert into public.profiles (user_id, currency_code, time_zone)
values
  ('11111111-1111-1111-1111-111111111111', 'EUR', 'Europe/Paris'),
  ('22222222-2222-2222-2222-222222222222', 'USD', 'America/New_York');

insert into public.recurring_incomes (user_id, label, amount_cents)
values
  ('11111111-1111-1111-1111-111111111111', 'Income A', 100000),
  ('22222222-2222-2222-2222-222222222222', 'Income B', 200000);

insert into public.recurring_fixed_expenses (user_id, label, amount_cents)
values
  ('11111111-1111-1111-1111-111111111111', 'Expense A', 30000),
  ('22222222-2222-2222-2222-222222222222', 'Expense B', 40000);

insert into public.savings_goals (
  user_id,
  name,
  target_amount_cents,
  current_amount_cents,
  monthly_allocation_cents
)
values
  ('11111111-1111-1111-1111-111111111111', 'Goal A', 500000, 100000, 25000),
  ('22222222-2222-2222-2222-222222222222', 'Goal B', 600000, 200000, 30000);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$select count(*) from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array[1::bigint],
  'A can read their own profile'
);
select results_eq(
  $$select count(*) from public.recurring_incomes where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array[1::bigint],
  'A can read their own income'
);
select results_eq(
  $$select count(*) from public.recurring_fixed_expenses where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array[1::bigint],
  'A can read their own expense'
);
select results_eq(
  $$select count(*) from public.savings_goals where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array[1::bigint],
  'A can read their own goal'
);

select is_empty(
  $$select user_id from public.profiles where user_id = '22222222-2222-2222-2222-222222222222'$$,
  'A cannot read B profile'
);
select is_empty(
  $$select user_id from public.recurring_incomes where user_id = '22222222-2222-2222-2222-222222222222'$$,
  'A cannot read B income'
);
select is_empty(
  $$select user_id from public.recurring_fixed_expenses where user_id = '22222222-2222-2222-2222-222222222222'$$,
  'A cannot read B expense'
);
select is_empty(
  $$select user_id from public.savings_goals where user_id = '22222222-2222-2222-2222-222222222222'$$,
  'A cannot read B goal'
);

select is_empty(
  $$update public.profiles set time_zone = 'UTC' where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot update B profile'
);
select is_empty(
  $$update public.recurring_incomes set label = 'Changed' where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot update B income'
);
select is_empty(
  $$update public.recurring_fixed_expenses set label = 'Changed' where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot update B expense'
);
select is_empty(
  $$update public.savings_goals set name = 'Changed' where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot update B goal'
);

select is_empty(
  $$delete from public.profiles where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot delete B profile'
);
select is_empty(
  $$delete from public.recurring_incomes where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot delete B income'
);
select is_empty(
  $$delete from public.recurring_fixed_expenses where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot delete B expense'
);
select is_empty(
  $$delete from public.savings_goals where user_id = '22222222-2222-2222-2222-222222222222' returning user_id$$,
  'A cannot delete B goal'
);

select throws_ok(
  $$insert into public.recurring_incomes (user_id, label, amount_cents) values ('22222222-2222-2222-2222-222222222222', 'Injected income', 1)$$,
  '42501',
  null,
  'A cannot create an income owned by B'
);
select throws_ok(
  $$insert into public.recurring_fixed_expenses (user_id, label, amount_cents) values ('22222222-2222-2222-2222-222222222222', 'Injected expense', 1)$$,
  '42501',
  null,
  'A cannot create an expense owned by B'
);
select throws_ok(
  $$insert into public.savings_goals (user_id, name, target_amount_cents) values ('22222222-2222-2222-2222-222222222222', 'Injected goal', 1)$$,
  '42501',
  null,
  'A cannot create a goal owned by B'
);

select * from finish();
rollback;
