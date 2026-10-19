-- AviTech Panel · Migración 004: gastos
-- Regla del dinero ×3: cada gasto se cubre con ingresos reales de clientes.
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  concepto text not null,
  categoria text not null default 'operativo',
  monto numeric(12,2) not null,
  fecha date not null default current_date,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists gastos_fecha_idx on public.gastos (fecha);
create index if not exists gastos_categoria_idx on public.gastos (categoria);

-- Seguridad (RLS): igual que las demás tablas → solo personal autenticado.

alter table public.gastos enable row level security;

drop policy if exists "gastos_select_autenticados" on public.gastos;
create policy "gastos_select_autenticados" on public.gastos
  for select to authenticated using (true);

drop policy if exists "gastos_insert_autenticados" on public.gastos;
create policy "gastos_insert_autenticados" on public.gastos
  for insert to authenticated with check (true);

drop policy if exists "gastos_update_autenticados" on public.gastos;
create policy "gastos_update_autenticados" on public.gastos
  for update to authenticated using (true) with check (true);

drop policy if exists "gastos_delete_autenticados" on public.gastos;
create policy "gastos_delete_autenticados" on public.gastos
  for delete to authenticated using (true);
