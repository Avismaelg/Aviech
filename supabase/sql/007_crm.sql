-- AviTech Panel · Migración 007: CRM
-- Empresas, contactos, oportunidades (pipeline) y actividades de seguimiento.
-- Modelo inspirado en Comp AI CRM (MIT): https://github.com/trycompai/crm
-- adaptado al panel interno de AviTech (Supabase + RLS por autenticación).
--
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

create table if not exists public.crm_empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dominio text,
  industria text,
  telefono text,
  sitio_web text,
  notas text,
  -- Se llena cuando la empresa se convierte en cliente del panel.
  cliente_id uuid references public.clientes(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists crm_empresas_nombre_idx on public.crm_empresas (nombre);
create index if not exists crm_empresas_cliente_idx on public.crm_empresas (cliente_id);

create table if not exists public.crm_contactos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.crm_empresas(id) on delete cascade,
  nombre text not null,
  cargo text,
  email text,
  telefono text,
  linkedin text,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists crm_contactos_empresa_idx on public.crm_contactos (empresa_id);
create index if not exists crm_contactos_nombre_idx on public.crm_contactos (nombre);

create table if not exists public.crm_oportunidades (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.crm_empresas(id) on delete set null,
  contacto_id uuid references public.crm_contactos(id) on delete set null,
  titulo text not null,
  etapa text not null default 'prospecto'
    check (etapa in ('prospecto', 'contactado', 'reunion', 'propuesta', 'negociacion', 'ganado', 'perdido')),
  monto numeric(14, 2) not null default 0 check (monto >= 0),
  probabilidad integer not null default 10 check (probabilidad between 0 and 100),
  fecha_cierre date,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_oportunidades_empresa_idx on public.crm_oportunidades (empresa_id);
create index if not exists crm_oportunidades_contacto_idx on public.crm_oportunidades (contacto_id);
create index if not exists crm_oportunidades_etapa_idx on public.crm_oportunidades (etapa);
create index if not exists crm_oportunidades_cierre_idx on public.crm_oportunidades (fecha_cierre);

create table if not exists public.crm_actividades (
  id uuid primary key default gen_random_uuid(),
  oportunidad_id uuid references public.crm_oportunidades(id) on delete cascade,
  contacto_id uuid references public.crm_contactos(id) on delete set null,
  tipo text not null default 'tarea'
    check (tipo in ('llamada', 'correo', 'reunion', 'tarea', 'nota')),
  titulo text not null,
  detalle text,
  fecha date not null default current_date,
  completada boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists crm_actividades_oportunidad_idx on public.crm_actividades (oportunidad_id);
create index if not exists crm_actividades_contacto_idx on public.crm_actividades (contacto_id);
create index if not exists crm_actividades_pendientes_idx on public.crm_actividades (completada, fecha);

-- Mantiene updated_at al día cuando cambia una oportunidad (etapa, monto, etc.).
create or replace function public.crm_tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_oportunidades_updated_at on public.crm_oportunidades;
create trigger crm_oportunidades_updated_at
  before update on public.crm_oportunidades
  for each row execute function public.crm_tocar_updated_at();

-- Seguridad (RLS): solo personal autenticado, igual que el resto del panel.
do $$
declare
  tabla text;
begin
  foreach tabla in array array['crm_empresas', 'crm_contactos', 'crm_oportunidades', 'crm_actividades']
  loop
    execute format('alter table public.%I enable row level security', tabla);
    execute format('drop policy if exists %I on public.%I', tabla || '_autenticados', tabla);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      tabla || '_autenticados',
      tabla
    );
  end loop;
end $$;
