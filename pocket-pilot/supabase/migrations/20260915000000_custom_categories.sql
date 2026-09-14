-- Catégories personnelles : chaque utilisateur peut créer ses propres
-- catégories en plus des 8 valeurs historiques. Les contraintes CHECK
-- fermées sur transactions.category et category_budgets.category deviennent
-- du texte libre borné ; les lignes existantes restent valides.

create table public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 50),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index user_categories_user_id_idx
  on public.user_categories (user_id);

grant select, insert, update, delete on table public.user_categories
  to authenticated;

alter table public.user_categories enable row level security;

create policy "user_categories: users manage own rows"
  on public.user_categories
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Relâche les listes fermées de catégories vers du texte libre borné.
-- Les noms de contraintes CHECK inline sont générés par Postgres
-- (transactions_category_check, category_budgets_category_check) : le bloc
-- DO les retrouve par définition pour rester robuste aux renommages.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%''Alimentation''%'
  loop
    execute format(
      'alter table public.transactions drop constraint %I',
      constraint_record.conname
    );
  end loop;

  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.category_budgets'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%''Alimentation''%'
  loop
    execute format(
      'alter table public.category_budgets drop constraint %I',
      constraint_record.conname
    );
  end loop;
end;
$$;

alter table public.transactions
  add check (char_length(btrim(category)) between 1 and 100);

alter table public.category_budgets
  add check (char_length(btrim(category)) between 1 and 100);
