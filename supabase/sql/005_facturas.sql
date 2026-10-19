-- AviTech Panel · Migración 005: facturación (facturas + líneas)
-- Comprobantes fiscales con NCF/e-NCF e ITBIS 18%.
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

create table if not exists public.facturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes (id) on delete set null,
  cliente_nombre text not null,
  cliente_rnc text,
  numero text,
  tipo text not null default 'B02',
  fecha date not null default current_date,
  aplica_itbis boolean not null default true,
  subtotal numeric(12,2) not null default 0,
  itbis numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  estado text not null default 'borrador',
  notas text,
  pago_id uuid references public.pagos (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.factura_items (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references public.facturas (id) on delete cascade,
  descripcion text not null,
  cantidad numeric(12,2) not null default 1,
  precio numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists facturas_fecha_idx on public.facturas (fecha);
create index if not exists facturas_estado_idx on public.facturas (estado);
create index if not exists facturas_cliente_idx on public.facturas (cliente_id);
create index if not exists factura_items_factura_idx on public.factura_items (factura_id);

-- Seguridad (RLS): igual que las demás tablas → solo personal autenticado.

alter table public.facturas enable row level security;

drop policy if exists "facturas_select_autenticados" on public.facturas;
create policy "facturas_select_autenticados" on public.facturas
  for select to authenticated using (true);

drop policy if exists "facturas_insert_autenticados" on public.facturas;
create policy "facturas_insert_autenticados" on public.facturas
  for insert to authenticated with check (true);

drop policy if exists "facturas_update_autenticados" on public.facturas;
create policy "facturas_update_autenticados" on public.facturas
  for update to authenticated using (true) with check (true);

drop policy if exists "facturas_delete_autenticados" on public.facturas;
create policy "facturas_delete_autenticados" on public.facturas
  for delete to authenticated using (true);

alter table public.factura_items enable row level security;

drop policy if exists "factura_items_select_autenticados" on public.factura_items;
create policy "factura_items_select_autenticados" on public.factura_items
  for select to authenticated using (true);

drop policy if exists "factura_items_insert_autenticados" on public.factura_items;
create policy "factura_items_insert_autenticados" on public.factura_items
  for insert to authenticated with check (true);

drop policy if exists "factura_items_update_autenticados" on public.factura_items;
create policy "factura_items_update_autenticados" on public.factura_items
  for update to authenticated using (true) with check (true);

drop policy if exists "factura_items_delete_autenticados" on public.factura_items;
create policy "factura_items_delete_autenticados" on public.factura_items
  for delete to authenticated using (true);
