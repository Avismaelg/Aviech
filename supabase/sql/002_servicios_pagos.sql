-- AviTech Panel · Migración 002: servicios y pagos + campos de clientes
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

-- 1) Clientes: campos nuevos para gestión comercial
alter table public.clientes add column if not exists empresa text;
alter table public.clientes add column if not exists estado text not null default 'activo';

-- 2) Servicios: trabajos de auditoría/consultoría por cliente
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null,
  tipo text not null default 'consultoria',
  estado text not null default 'pendiente',
  monto numeric(12,2),
  fecha_inicio date,
  fecha_fin date,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists servicios_cliente_id_idx on public.servicios (cliente_id);
create index if not exists servicios_estado_idx on public.servicios (estado);

-- 3) Pagos: ingresos por cliente
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  concepto text not null,
  monto numeric(12,2) not null,
  fecha date not null default current_date,
  estado text not null default 'pendiente',
  metodo text,
  created_at timestamptz not null default now()
);

create index if not exists pagos_cliente_id_idx on public.pagos (cliente_id);
create index if not exists pagos_estado_idx on public.pagos (estado);
create index if not exists pagos_fecha_idx on public.pagos (fecha);

-- 4) Seguridad (RLS): igual que clientes → solo personal autenticado.

alter table public.servicios enable row level security;
alter table public.pagos enable row level security;

drop policy if exists "servicios_select_autenticados" on public.servicios;
create policy "servicios_select_autenticados" on public.servicios
  for select to authenticated using (true);

drop policy if exists "servicios_insert_autenticados" on public.servicios;
create policy "servicios_insert_autenticados" on public.servicios
  for insert to authenticated with check (true);

drop policy if exists "servicios_update_autenticados" on public.servicios;
create policy "servicios_update_autenticados" on public.servicios
  for update to authenticated using (true) with check (true);

drop policy if exists "servicios_delete_autenticados" on public.servicios;
create policy "servicios_delete_autenticados" on public.servicios
  for delete to authenticated using (true);

drop policy if exists "pagos_select_autenticados" on public.pagos;
create policy "pagos_select_autenticados" on public.pagos
  for select to authenticated using (true);

drop policy if exists "pagos_insert_autenticados" on public.pagos;
create policy "pagos_insert_autenticados" on public.pagos
  for insert to authenticated with check (true);

drop policy if exists "pagos_update_autenticados" on public.pagos;
create policy "pagos_update_autenticados" on public.pagos
  for update to authenticated using (true) with check (true);

drop policy if exists "pagos_delete_autenticados" on public.pagos;
create policy "pagos_delete_autenticados" on public.pagos
  for delete to authenticated using (true);
