create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents bigint not null check (
    amount_cents > 0 and amount_cents <= 9007199254740991
  ),
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
  description text not null default '' check (
    char_length(btrim(description)) <= 200
  ),
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc, created_at desc);

create function public.set_transaction_updated_at()
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

revoke all on function public.set_transaction_updated_at() from public;

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_transaction_updated_at();

grant select, insert, update, delete on table public.transactions to authenticated;

alter table public.transactions enable row level security;

create policy "transactions: users manage own rows"
  on public.transactions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
