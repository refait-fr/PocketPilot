-- Jetons d’accès personnels pour l’API Raccourci iOS : un jeton permet
-- d’enregistrer une transaction via POST /api/transactions sans session
-- navigateur. Seule l’empreinte SHA-256 est stockée, jamais le jeton.

create table public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 50),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index api_tokens_user_id_idx
  on public.api_tokens (user_id);

grant select, insert, update, delete on table public.api_tokens
  to authenticated;

alter table public.api_tokens enable row level security;

create policy "api_tokens: users manage own rows"
  on public.api_tokens
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
