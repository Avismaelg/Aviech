-- AviTech Panel · Migración 013: NCF/e-NCF único por factura
--
-- Evita emitir dos comprobantes fiscales con el mismo número. El panel ya
-- comprueba antes de guardar, pero la base también debe proteger el dato.
--
-- Es idempotente. Aplicar a mano en Supabase → SQL Editor → Run.
-- No se ejecuta automáticamente desde el frontend.

create or replace function public.validar_ncf_unico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.numero is null then
    return new;
  end if;

  if exists (
    select 1
    from public.facturas
    where numero = new.numero
      and id <> new.id
  ) then
    raise exception 'Ya existe una factura con el NCF/e-NCF %.', new.numero
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists facturas_ncf_unico on public.facturas;
create trigger facturas_ncf_unico
before insert or update of numero on public.facturas
for each row
execute function public.validar_ncf_unico();

-- Índice de búsqueda y refuerzo de unicidad. Si ya hubiera duplicados
-- históricos, se avisa y no se crea el índice para no romper la migración.
do $$
begin
  if exists (
    select 1
    from public.facturas
    where numero is not null
    group by numero
    having count(*) > 1
  ) then
    raise notice 'Hay NCF duplicados en facturas: revisa y corrige antes de crear el índice único.';
  else
    execute 'create unique index if not exists facturas_numero_unico on public.facturas (numero) where numero is not null';
  end if;
end;
$$;

notify pgrst, 'reload schema';
