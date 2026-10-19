-- AviTech Panel · Migración 006: igualas (contratos mensuales)
-- Servicios recurrentes tipo retainer: contabilidad, software y asesoría legal.
-- El monto es mensual (RD$/mes) y el día de cobro se agenda entre 1 y 28.
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

create table if not exists public.igualas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  categoria text not null default 'contabilidad',
  descripcion text not null,
  monto_mensual numeric(12,2) not null,
  dia_cobro integer not null default 1 check (dia_cobro between 1 and 28),
  fecha_inicio date not null default current_date,
  estado text not null default 'activa',
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists igualas_cliente_idx on public.igualas (cliente_id);
create index if not exists igualas_estado_idx on public.igualas (estado);
create index if not exists igualas_categoria_idx on public.igualas (categoria);

-- Seguridad (RLS): igual que las demás tablas → solo personal autenticado.

alter table public.igualas enable row level security;

drop policy if exists "igualas_select_autenticados" on public.igualas;
create policy "igualas_select_autenticados" on public.igualas
  for select to authenticated using (true);

drop policy if exists "igualas_insert_autenticados" on public.igualas;
create policy "igualas_insert_autenticados" on public.igualas
  for insert to authenticated with check (true);

drop policy if exists "igualas_update_autenticados" on public.igualas;
create policy "igualas_update_autenticados" on public.igualas
  for update to authenticated using (true) with check (true);

drop policy if exists "igualas_delete_autenticados" on public.igualas;
create policy "igualas_delete_autenticados" on public.igualas
  for delete to authenticated using (true);
