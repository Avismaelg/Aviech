-- AviTech Panel · Migración 008: Auditor SEO
-- Historial de auditorías SEO hechas desde el panel.
-- Flujo inspirado en el "Site Audit" de OpenSEO (https://github.com/every-app/open-seo,
-- licencia MIT); la implementación (Worker + interfaz) es propia del panel.
--
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

create table if not exists public.seo_auditorias (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  dominio text not null,
  puntaje integer not null default 0 check (puntaje between 0 and 100),
  -- Resultado completo de la auditoría (chequeos, encabezados, enlaces, archivos…)
  -- y, si se midió, el resumen de PageSpeed.
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists seo_auditorias_dominio_idx on public.seo_auditorias (dominio);
create index if not exists seo_auditorias_fecha_idx on public.seo_auditorias (created_at desc);

-- Seguridad (RLS): solo personal autenticado, igual que el resto del panel.
alter table public.seo_auditorias enable row level security;
drop policy if exists seo_auditorias_autenticados on public.seo_auditorias;
create policy seo_auditorias_autenticados on public.seo_auditorias
  for all to authenticated using (true) with check (true);
