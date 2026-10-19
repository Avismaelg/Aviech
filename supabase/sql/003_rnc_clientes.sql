-- AviTech Panel · Migración 003: RNC del cliente (República Dominicana)
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

-- RNC (Registro Nacional del Contribuyente) para facturación formal (DGII).
alter table public.clientes add column if not exists rnc text;
