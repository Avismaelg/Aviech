-- AviTech Panel · Migración 009: solicitudes de servicio y ejecución automática
-- Flujo: el cliente (o el personal) envía una solicitud → la IA analiza, redacta
-- la propuesta y el informe, crea cliente/CRM/servicio y deja el trabajo cerrado.
-- El personal puede revisar, corregir o volver a ejecutar.
--
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

-- 1) Bandeja de solicitudes. El token público permite que el Worker cierre una
--    solicitud enviada desde el formulario abierto sin exponer la tabla a anon.
create table if not exists public.solicitudes_servicio (
  id uuid primary key default gen_random_uuid(),
  token_publico uuid not null default gen_random_uuid(),
  origen text not null default 'interno'
    check (origen in ('interno', 'publico')),
  canal text not null default 'formulario'
    check (canal in ('formulario', 'whatsapp', 'correo', 'llamada', 'presencial', 'otro')),
  cliente_id uuid references public.clientes(id) on delete set null,
  solicitante_nombre text not null,
  empresa text,
  email text,
  telefono text,
  sitio_web text,
  tipo text not null default 'consultoria',
  titulo text not null,
  descripcion text not null,
  objetivos text,
  presupuesto numeric(12, 2) check (presupuesto is null or presupuesto >= 0),
  urgencia text not null default 'media'
    check (urgencia in ('baja', 'media', 'alta')),
  fecha_deseada date,
  estado text not null default 'nueva'
    check (estado in ('nueva', 'analizando', 'completada', 'error', 'rechazada')),
  plan_ia jsonb,
  informe_ia text,
  propuesta_ia text,
  correo_ia text,
  precio_sugerido numeric(12, 2) check (precio_sugerido is null or precio_sugerido >= 0),
  servicio_id uuid references public.servicios(id) on delete set null,
  oportunidad_id uuid references public.crm_oportunidades(id) on delete set null,
  empresa_id uuid references public.crm_empresas(id) on delete set null,
  contacto_id uuid references public.crm_contactos(id) on delete set null,
  cliente_creado boolean not null default false,
  error_ia text,
  ejecutado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists solicitudes_servicio_estado_idx on public.solicitudes_servicio (estado, created_at desc);
create index if not exists solicitudes_servicio_cliente_idx on public.solicitudes_servicio (cliente_id);
create index if not exists solicitudes_servicio_email_idx on public.solicitudes_servicio (lower(email));
create index if not exists solicitudes_servicio_origen_idx on public.solicitudes_servicio (origen, created_at desc);

-- 2) El servicio guarda el alcance, el plan y el informe que produjo la IA.
alter table public.servicios add column if not exists solicitud_id uuid
  references public.solicitudes_servicio(id) on delete set null;
alter table public.servicios add column if not exists descripcion text;
alter table public.servicios add column if not exists entregables text;
alter table public.servicios add column if not exists informe text;
alter table public.servicios add column if not exists plan_ia jsonb;
alter table public.servicios add column if not exists progreso integer not null default 0;
alter table public.servicios add column if not exists ejecutado_por_ia boolean not null default false;

create unique index if not exists servicios_solicitud_id_uidx
  on public.servicios (solicitud_id) where solicitud_id is not null;

-- 3) Mantiene updated_at al día.
create or replace function public.solicitudes_tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists solicitudes_servicio_updated_at on public.solicitudes_servicio;
create trigger solicitudes_servicio_updated_at
  before update on public.solicitudes_servicio
  for each row execute function public.solicitudes_tocar_updated_at();

-- 4) Seguridad: el personal autenticado ve y edita todo. Anon no toca la tabla:
--    el formulario público pasa por las funciones de abajo.
alter table public.solicitudes_servicio enable row level security;
drop policy if exists solicitudes_servicio_autenticados on public.solicitudes_servicio;
create policy solicitudes_servicio_autenticados on public.solicitudes_servicio
  for all to authenticated using (true) with check (true);

-- 5) Alta pública. Devuelve id + token al Worker; el navegador solo recibe el folio.
create or replace function public.crear_solicitud_publica(
  p_nombre text,
  p_empresa text,
  p_email text,
  p_telefono text,
  p_sitio_web text,
  p_tipo text,
  p_titulo text,
  p_descripcion text,
  p_objetivos text,
  p_presupuesto numeric,
  p_urgencia text,
  p_fecha_deseada date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_token uuid;
  v_nombre text := left(btrim(coalesce(p_nombre, '')), 120);
  v_descripcion text := left(btrim(coalesce(p_descripcion, '')), 4000);
  v_email text := nullif(left(btrim(coalesce(p_email, '')), 160), '');
  v_tipo text := coalesce(nullif(left(btrim(p_tipo), 40), ''), 'consultoria');
  v_urgencia text := coalesce(nullif(left(btrim(p_urgencia), 20), ''), 'media');
begin
  if length(v_nombre) < 2 then
    raise exception 'Escribe tu nombre.' using errcode = '22023';
  end if;
  if length(v_descripcion) < 20 then
    raise exception 'Describe el servicio con un poco más de detalle.' using errcode = '22023';
  end if;
  if v_email is not null and v_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    raise exception 'El correo no tiene un formato válido.' using errcode = '22023';
  end if;
  if v_email is null and nullif(btrim(coalesce(p_telefono, '')), '') is null then
    raise exception 'Deja un correo o un teléfono para contactarte.' using errcode = '22023';
  end if;
  if v_tipo not in ('auditoria', 'consultoria', 'implementacion', 'capacitacion', 'seo', 'contabilidad', 'otro') then
    v_tipo := 'otro';
  end if;
  if v_urgencia not in ('baja', 'media', 'alta') then
    v_urgencia := 'media';
  end if;

  insert into public.solicitudes_servicio (
    origen, canal, solicitante_nombre, empresa, email, telefono, sitio_web,
    tipo, titulo, descripcion, objetivos, presupuesto, urgencia, fecha_deseada,
    estado
  ) values (
    'publico', 'formulario', v_nombre,
    nullif(left(btrim(coalesce(p_empresa, '')), 160), ''),
    v_email, nullif(left(btrim(coalesce(p_telefono, '')), 40), ''),
    nullif(left(btrim(coalesce(p_sitio_web, '')), 300), ''),
    v_tipo, left(coalesce(nullif(btrim(p_titulo), ''), 'Solicitud de ' || v_tipo), 180),
    v_descripcion, nullif(left(btrim(coalesce(p_objetivos, '')), 2000), ''),
    case when p_presupuesto is null then null else greatest(p_presupuesto, 0) end,
    v_urgencia, p_fecha_deseada,
    'analizando'
  )
  returning id, token_publico into v_id, v_token;

  return jsonb_build_object('id', v_id, 'token', v_token);
end;
$$;

-- 6) Cierre automático: crea (o reutiliza) cliente, empresa, contacto,
--    oportunidad, servicio y auditoría SEO; guarda propuesta, correo e informe.
create or replace function public.finalizar_solicitud(
  p_id uuid,
  p_token uuid,
  p_plan jsonb,
  p_informe text,
  p_propuesta text,
  p_correo text,
  p_precio numeric,
  p_auditoria jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sol public.solicitudes_servicio%rowtype;
  v_cliente uuid;
  v_empresa uuid;
  v_contacto uuid;
  v_oportunidad uuid;
  v_servicio uuid;
  v_precio numeric := greatest(coalesce(p_precio, 0), 0);
  v_cliente_creado boolean := false;
  v_dominio text;
  v_entregables text;
  v_nombre_empresa text;
begin
  select * into v_sol
  from public.solicitudes_servicio
  where id = p_id
  for update;

  if not found or p_token is null or v_sol.token_publico <> p_token then
    raise exception 'La solicitud no es válida o ya no está disponible.' using errcode = '42501';
  end if;

  if v_sol.servicio_id is not null then
    return jsonb_build_object(
      'solicitud_id', v_sol.id,
      'cliente_id', v_sol.cliente_id,
      'servicio_id', v_sol.servicio_id,
      'oportunidad_id', v_sol.oportunidad_id,
      'empresa_id', v_sol.empresa_id,
      'contacto_id', v_sol.contacto_id,
      'repetida', true
    );
  end if;

  p_plan := coalesce(p_plan, '{}'::jsonb);
  p_informe := coalesce(p_informe, '');
  p_propuesta := coalesce(p_propuesta, '');
  p_correo := coalesce(p_correo, '');

  -- Cliente: reutiliza por correo o teléfono; si no existe, lo crea.
  v_cliente := v_sol.cliente_id;
  if v_cliente is null and v_sol.email is not null then
    select id into v_cliente from public.clientes
    where lower(email) = lower(v_sol.email)
    order by created_at limit 1;
  end if;
  if v_cliente is null
     and v_sol.telefono is not null
     and regexp_replace(v_sol.telefono, '\D', '', 'g') <> '' then
    select id into v_cliente from public.clientes
    where regexp_replace(coalesce(telefono, ''), '\D', '', 'g') =
          regexp_replace(v_sol.telefono, '\D', '', 'g')
    order by created_at limit 1;
  end if;
  if v_cliente is null then
    insert into public.clientes (nombre, empresa, email, telefono, estado, notas)
    values (
      v_sol.solicitante_nombre, v_sol.empresa, v_sol.email, v_sol.telefono, 'activo',
      'Cliente creado automáticamente desde una solicitud de servicio.'
    )
    returning id into v_cliente;
    v_cliente_creado := true;
  end if;

  v_nombre_empresa := coalesce(nullif(v_sol.empresa, ''), v_sol.solicitante_nombre);
  v_dominio := null;
  if v_sol.sitio_web is not null then
    v_dominio := lower(split_part(regexp_replace(v_sol.sitio_web, '^https?://', '', 'i'), '/', 1));
  end if;

  select id into v_empresa from public.crm_empresas
  where lower(nombre) = lower(v_nombre_empresa)
     or (v_dominio is not null and lower(coalesce(dominio, '')) = v_dominio)
  order by created_at limit 1;

  if v_empresa is null then
    insert into public.crm_empresas (nombre, dominio, telefono, sitio_web, notas, cliente_id)
    values (
      v_nombre_empresa, v_dominio, v_sol.telefono, v_sol.sitio_web,
      'Empresa creada automáticamente desde una solicitud de servicio.', v_cliente
    )
    returning id into v_empresa;
  elsif not exists (select 1 from public.crm_empresas where id = v_empresa and cliente_id is not null) then
    update public.crm_empresas set cliente_id = v_cliente where id = v_empresa;
  end if;

  select id into v_contacto from public.crm_contactos
  where empresa_id = v_empresa
    and (
      (v_sol.email is not null and lower(coalesce(email, '')) = lower(v_sol.email))
      or (v_sol.email is null and lower(nombre) = lower(v_sol.solicitante_nombre))
    )
  order by created_at limit 1;

  if v_contacto is null then
    insert into public.crm_contactos (empresa_id, nombre, email, telefono, notas)
    values (
      v_empresa, v_sol.solicitante_nombre, v_sol.email, v_sol.telefono,
      'Contacto creado automáticamente desde una solicitud de servicio.'
    )
    returning id into v_contacto;
  end if;

  insert into public.crm_oportunidades (
    empresa_id, contacto_id, titulo, etapa, monto, probabilidad, fecha_cierre, notas
  ) values (
    v_empresa, v_contacto, v_sol.titulo, 'ganado', v_precio, 100, current_date,
    'Oportunidad creada y cerrada por la IA a partir de la solicitud ' || v_sol.id::text || '.'
  )
  returning id into v_oportunidad;

  if jsonb_typeof(coalesce(p_plan -> 'entregables', '[]'::jsonb)) = 'array' then
    select string_agg(entrega, E'\n')
    into v_entregables
    from jsonb_array_elements_text(p_plan -> 'entregables') as t(entrega);
  end if;

  insert into public.servicios (
    cliente_id, solicitud_id, titulo, tipo, estado, monto, fecha_inicio, fecha_fin,
    notas, descripcion, entregables, informe, plan_ia, progreso, ejecutado_por_ia
  ) values (
    v_cliente, v_sol.id, v_sol.titulo, v_sol.tipo, 'completado', nullif(v_precio, 0),
    current_date, current_date,
    'Solicitud ' || v_sol.id::text || ' · ' || v_sol.origen || ' · Creado y cerrado por la IA.',
    v_sol.descripcion, v_entregables, p_informe, p_plan, 100, true
  )
  returning id into v_servicio;

  insert into public.crm_actividades (
    oportunidad_id, contacto_id, tipo, titulo, detalle, fecha, completada
  ) values (
    v_oportunidad, v_contacto, 'nota', 'Servicio completado por IA',
    left(v_sol.titulo || E'\n\n' || p_informe, 2000), current_date, true
  );

  if p_auditoria is not null and (p_auditoria ? 'url') then
    insert into public.seo_auditorias (url, dominio, puntaje, datos)
    values (
      p_auditoria ->> 'url',
      coalesce(p_auditoria ->> 'dominio', ''),
      greatest(0, least(100, coalesce((p_auditoria ->> 'puntaje')::int, 0))),
      p_auditoria
    );
  end if;

  update public.solicitudes_servicio set
    estado = 'completada',
    cliente_id = v_cliente,
    servicio_id = v_servicio,
    oportunidad_id = v_oportunidad,
    empresa_id = v_empresa,
    contacto_id = v_contacto,
    cliente_creado = v_cliente_creado,
    plan_ia = p_plan,
    informe_ia = p_informe,
    propuesta_ia = p_propuesta,
    correo_ia = p_correo,
    precio_sugerido = v_precio,
    error_ia = null,
    ejecutado_en = now()
  where id = p_id;

  return jsonb_build_object(
    'solicitud_id', p_id,
    'cliente_id', v_cliente,
    'servicio_id', v_servicio,
    'oportunidad_id', v_oportunidad,
    'empresa_id', v_empresa,
    'contacto_id', v_contacto,
    'repetida', false
  );
end;
$$;

-- 7) Error controlado: deja la solicitud lista para reintentar.
create or replace function public.marcar_solicitud_error(
  p_id uuid,
  p_token uuid,
  p_error text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actualizada integer;
begin
  update public.solicitudes_servicio
  set estado = 'error',
      error_ia = left(coalesce(p_error, 'Error desconocido.'), 500)
  where id = p_id
    and token_publico = p_token
    and servicio_id is null;
  get diagnostics v_actualizada = row_count;
  return v_actualizada > 0;
end;
$$;

-- 8) Permisos de las funciones. Anon solo puede crear y cerrar con el token
--    que devuelve la creación; nunca puede leer la bandeja.
revoke all on function public.crear_solicitud_publica(text, text, text, text, text, text, text, text, text, numeric, text, date) from public;
revoke all on function public.finalizar_solicitud(uuid, uuid, jsonb, text, text, text, numeric, jsonb) from public;
revoke all on function public.marcar_solicitud_error(uuid, uuid, text) from public;

grant execute on function public.crear_solicitud_publica(text, text, text, text, text, text, text, text, text, numeric, text, date) to anon, authenticated;
grant execute on function public.finalizar_solicitud(uuid, uuid, jsonb, text, text, text, numeric, jsonb) to anon, authenticated;
grant execute on function public.marcar_solicitud_error(uuid, uuid, text) to anon, authenticated;
