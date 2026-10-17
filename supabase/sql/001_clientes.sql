-- AviTech Panel · Módulo de clientes (Fase 1)
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- Es idempotente: puedes ejecutarlo más de una vez sin romper nada.

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text,
  telefono text,
  notas text,
  created_at timestamptz not null default now()
);

-- Seguridad: RLS activado SIEMPRE. Sin políticas, nadie accede.
alter table public.clientes enable row level security;

-- Acceso completo solo para usuarios autenticados (personal del panel).
-- Más adelante se puede restringir por rol o por usuario.

drop policy if exists "clientes_select_autenticados" on public.clientes;
create policy "clientes_select_autenticados" on public.clientes
  for select to authenticated
  using (true);

drop policy if exists "clientes_insert_autenticados" on public.clientes;
create policy "clientes_insert_autenticados" on public.clientes
  for insert to authenticated
  with check (true);

drop policy if exists "clientes_update_autenticados" on public.clientes;
create policy "clientes_update_autenticados" on public.clientes
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists "clientes_delete_autenticados" on public.clientes;
create policy "clientes_delete_autenticados" on public.clientes
  for delete to authenticated
  using (true);
