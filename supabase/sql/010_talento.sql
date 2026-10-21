-- 010_talento.sql
-- Módulo de Talento: candidatos, empresas empleadoras, vacantes y procesos.
-- El panel interno (authenticated) gestiona todo. El portal público solo usa
-- funciones security definer y un bucket privado para los CV en PDF.

-- ---------------------------------------------------------------- tablas

create table if not exists public.talento_candidatos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  ubicacion text,
  puesto_objetivo text not null,
  seniority text not null default 'mid'
    check (seniority in ('junior', 'mid', 'senior', 'lead', 'director')),
  modalidad text not null default 'hibrido'
    check (modalidad in ('presencial', 'hibrido', 'remoto', 'flexible')),
  habilidades text[] not null default '{}',
  experiencia text,
  educacion text,
  disponibilidad text,
  expectativa_salarial numeric(12, 2)
    check (expectativa_salarial is null or expectativa_salarial >= 0),
  cv_path text,
  cv_url text,
  cv_nombre text,
  estado text not null default 'nuevo'
    check (estado in ('nuevo', 'evaluando', 'entrevista', 'oferta', 'contratado', 'descartado')),
  visible_empresas boolean not null default true,
  consentimiento boolean not null default false,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists talento_candidatos_email_idx
  on public.talento_candidatos (lower(email));
create index if not exists talento_candidatos_estado_idx
  on public.talento_candidatos (estado);
create index if not exists talento_candidatos_visible_idx
  on public.talento_candidatos (visible_empresas, estado);

create table if not exists public.talento_empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sector text,
  sitio_web text,
  ubicacion text,
  contacto_nombre text not null,
  contacto_email text not null,
  contacto_telefono text,
  estado text not null default 'prospecto'
    check (estado in ('prospecto', 'activa', 'pausada', 'cerrada')),
  consentimiento boolean not null default false,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists talento_empresas_nombre_idx
  on public.talento_empresas (lower(nombre));
create index if not exists talento_empresas_estado_idx
  on public.talento_empresas (estado);

create table if not exists public.talento_vacantes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.talento_empresas(id) on delete cascade,
  titulo text not null,
  descripcion text not null,
  requisitos text,
  responsabilidades text,
  ubicacion text,
  modalidad text not null default 'hibrido'
    check (modalidad in ('presencial', 'hibrido', 'remoto', 'flexible')),
  seniority text not null default 'mid'
    check (seniority in ('junior', 'mid', 'senior', 'lead', 'director')),
  tipo_contrato text not null default 'tiempo_completo'
    check (tipo_contrato in ('tiempo_completo', 'medio_tiempo', 'contrato', 'temporal', 'practica')),
  salario_min numeric(12, 2)
    check (salario_min is null or salario_min >= 0),
  salario_max numeric(12, 2)
    check (salario_max is null or salario_max >= 0),
  estado text not null default 'borrador'
    check (estado in ('borrador', 'abierta', 'pausada', 'cerrada')),
  publica boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint talento_vacantes_salario_check
    check (salario_min is null or salario_max is null or salario_min <= salario_max)
);

create index if not exists talento_vacantes_empresa_idx
  on public.talento_vacantes (empresa_id);
create index if not exists talento_vacantes_estado_idx
  on public.talento_vacantes (estado, publica);

create table if not exists public.talento_postulaciones (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.talento_candidatos(id) on delete cascade,
  empresa_id uuid not null references public.talento_empresas(id) on delete cascade,
  vacante_id uuid references public.talento_vacantes(id) on delete set null,
  etapa text not null default 'recibida'
    check (etapa in ('recibida', 'preseleccion', 'entrevista', 'oferta', 'contratada', 'rechazada')),
  origen text not null default 'interno'
    check (origen in ('publico', 'empresa', 'interno', 'ia', 'referido')),
  solicitud_tipo text
    check (solicitud_tipo is null or solicitud_tipo in ('entrevista', 'contratacion')),
  match_score integer
    check (match_score is null or (match_score >= 0 and match_score <= 100)),
  match_motivo text,
  notas text,
  fecha_entrevista timestamptz,
  entrevista_tipo text
    check (entrevista_tipo is null or entrevista_tipo in ('telefonica', 'virtual', 'presencial', 'tecnica')),
  entrevistador text,
  resultado_entrevista text,
  fecha_inicio date,
  salario_final numeric(12, 2)
    check (salario_final is null or salario_final >= 0),
  comision numeric(12, 2)
    check (comision is null or comision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Si la tabla ya existía con borrado en cascada, se conserva el historial:
-- al eliminar una vacante, sus procesos quedan sin vacante asociada.
do $$
begin
  alter table public.talento_postulaciones
    drop constraint if exists talento_postulaciones_vacante_id_fkey;
  alter table public.talento_postulaciones
    add constraint talento_postulaciones_vacante_id_fkey
    foreign key (vacante_id) references public.talento_vacantes(id) on delete set null;
exception
  when duplicate_object then null;
end $$;

create unique index if not exists talento_postulaciones_vacante_unica
  on public.talento_postulaciones (candidato_id, vacante_id)
  where vacante_id is not null;
create index if not exists talento_postulaciones_candidato_idx
  on public.talento_postulaciones (candidato_id);
create index if not exists talento_postulaciones_empresa_idx
  on public.talento_postulaciones (empresa_id);
create index if not exists talento_postulaciones_vacante_idx
  on public.talento_postulaciones (vacante_id);
create index if not exists talento_postulaciones_etapa_idx
  on public.talento_postulaciones (etapa);
create index if not exists talento_postulaciones_entrevista_idx
  on public.talento_postulaciones (fecha_entrevista);

-- ---------------------------------------------------------------- updated_at

create or replace function public.talento_tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'talento_candidatos',
    'talento_empresas',
    'talento_vacantes',
    'talento_postulaciones'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', tabla || '_updated_at', tabla);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.talento_tocar_updated_at()',
      tabla || '_updated_at',
      tabla
    );
  end loop;
end $$;

-- ---------------------------------------------------------------- RLS

do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'talento_candidatos',
    'talento_empresas',
    'talento_vacantes',
    'talento_postulaciones'
  ]
  loop
    execute format('alter table public.%I enable row level security', tabla);
    execute format('revoke all on public.%I from anon', tabla);
    execute format('grant select, insert, update, delete on public.%I to authenticated', tabla);
    execute format('drop policy if exists %I on public.%I', tabla || '_autenticados', tabla);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      tabla || '_autenticados',
      tabla
    );
  end loop;
end $$;

-- ---------------------------------------------------------------- CV privado

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('talento-cv', 'talento-cv', false, 5242880, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['application/pdf'];

drop policy if exists talento_cv_subida_publica on storage.objects;
create policy talento_cv_subida_publica on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'talento-cv'
    and (storage.foldername(name))[1] = 'publico'
  );

drop policy if exists talento_cv_lectura_autenticada on storage.objects;
create policy talento_cv_lectura_autenticada on storage.objects
  for select to authenticated
  using (bucket_id = 'talento-cv');

drop policy if exists talento_cv_eliminar_autenticado on storage.objects;
create policy talento_cv_eliminar_autenticado on storage.objects
  for delete to authenticated
  using (bucket_id = 'talento-cv');

-- ---------------------------------------------------------------- portal público

create or replace function public.listar_vacantes_publicas()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', v.id,
    'titulo', v.titulo,
    'empresa_nombre', e.nombre,
    'sector', e.sector,
    'ubicacion', v.ubicacion,
    'modalidad', v.modalidad,
    'seniority', v.seniority,
    'tipo_contrato', v.tipo_contrato,
    'salario_min', v.salario_min,
    'salario_max', v.salario_max,
    'descripcion', v.descripcion,
    'requisitos', v.requisitos,
    'created_at', v.created_at
  )), '[]'::jsonb)
  from (
    select *
    from public.talento_vacantes
    where estado = 'abierta' and publica = true
    order by created_at desc
    limit 60
  ) v
  join public.talento_empresas e on e.id = v.empresa_id;
$$;

create or replace function public.listar_candidatos_publicos()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'nombre_publico',
      case
        when position(' ' in c.nombre) > 0
          then split_part(c.nombre, ' ', 1) || ' ' || left(split_part(c.nombre, ' ', 2), 1) || '.'
        else c.nombre
      end,
    'puesto_objetivo', c.puesto_objetivo,
    'seniority', c.seniority,
    'modalidad', c.modalidad,
    'ubicacion', c.ubicacion,
    'habilidades', c.habilidades,
    'experiencia', left(coalesce(c.experiencia, ''), 320),
    'disponibilidad', c.disponibilidad,
    'expectativa_salarial', c.expectativa_salarial,
    'cv_disponible', (c.cv_path is not null or c.cv_url is not null),
    'created_at', c.created_at
  )), '[]'::jsonb)
  from (
    select *
    from public.talento_candidatos
    where visible_empresas = true
      and consentimiento = true
      and estado not in ('descartado', 'contratado')
    order by created_at desc
    limit 100
  ) c;
$$;

create or replace function public.crear_postulacion_publica(
  p_nombre text,
  p_email text,
  p_telefono text,
  p_ubicacion text,
  p_puesto_objetivo text,
  p_seniority text,
  p_modalidad text,
  p_habilidades text[],
  p_experiencia text,
  p_educacion text,
  p_disponibilidad text,
  p_expectativa_salarial numeric,
  p_cv_path text,
  p_cv_url text,
  p_cv_nombre text,
  p_consentimiento boolean,
  p_visible_empresas boolean,
  p_vacante_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidato uuid;
  v_postulacion uuid;
  v_empresa uuid;
  v_existente boolean := false;
  v_nombre text := left(btrim(coalesce(p_nombre, '')), 120);
  v_email text := lower(nullif(left(btrim(coalesce(p_email, '')), 160), ''));
  v_puesto text := left(btrim(coalesce(p_puesto_objetivo, '')), 180);
  v_seniority text := coalesce(nullif(left(btrim(p_seniority), 20), ''), 'mid');
  v_modalidad text := coalesce(nullif(left(btrim(p_modalidad), 20), ''), 'hibrido');
  v_habilidades text[];
  v_cv_path text := nullif(left(btrim(coalesce(p_cv_path, '')), 500), '');
  v_cv_url text := nullif(left(btrim(coalesce(p_cv_url, '')), 500), '');
begin
  if length(v_nombre) < 2 then
    raise exception 'Escribe tu nombre.' using errcode = '22023';
  end if;
  if v_email is null or v_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    raise exception 'El correo no tiene un formato válido.' using errcode = '22023';
  end if;
  if length(v_puesto) < 2 then
    raise exception 'Indica qué puesto buscas.' using errcode = '22023';
  end if;
  if p_consentimiento is not true then
    raise exception 'Debes autorizar el uso de tus datos.' using errcode = '22023';
  end if;
  if v_seniority not in ('junior', 'mid', 'senior', 'lead', 'director') then
    v_seniority := 'mid';
  end if;
  if v_modalidad not in ('presencial', 'hibrido', 'remoto', 'flexible') then
    v_modalidad := 'hibrido';
  end if;
  if v_cv_path is not null and v_cv_path !~* '^publico/[a-z0-9._-]{1,120}\.pdf$' then
    raise exception 'El archivo del CV no es válido.' using errcode = '22023';
  end if;
  if v_cv_url is not null and v_cv_url !~* '^https?://[^[:space:]]+$' then
    raise exception 'El enlace del CV no es válido.' using errcode = '22023';
  end if;

  select coalesce(array_agg(distinct left(btrim(x), 40)) filter (where btrim(x) <> ''), '{}')
  into v_habilidades
  from unnest(coalesce(p_habilidades, '{}')) x;

  if p_vacante_id is not null then
    select empresa_id into v_empresa
    from public.talento_vacantes
    where id = p_vacante_id and estado = 'abierta' and publica = true;

    if v_empresa is null then
      raise exception 'La vacante ya no está disponible.' using errcode = '22023';
    end if;
  end if;

  select id into v_candidato
  from public.talento_candidatos
  where lower(email) = v_email
  limit 1;

  if v_candidato is null then
    insert into public.talento_candidatos (
      nombre, email, telefono, ubicacion, puesto_objetivo, seniority, modalidad,
      habilidades, experiencia, educacion, disponibilidad, expectativa_salarial,
      cv_path, cv_url, cv_nombre, consentimiento, visible_empresas, estado
    ) values (
      v_nombre, v_email,
      nullif(left(btrim(coalesce(p_telefono, '')), 40), ''),
      nullif(left(btrim(coalesce(p_ubicacion, '')), 120), ''),
      v_puesto, v_seniority, v_modalidad, v_habilidades,
      nullif(left(btrim(coalesce(p_experiencia, '')), 3000), ''),
      nullif(left(btrim(coalesce(p_educacion, '')), 1000), ''),
      nullif(left(btrim(coalesce(p_disponibilidad, '')), 80), ''),
      case when p_expectativa_salarial is null then null else greatest(p_expectativa_salarial, 0) end,
      v_cv_path,
      v_cv_url,
      nullif(left(btrim(coalesce(p_cv_nombre, '')), 180), ''),
      true, coalesce(p_visible_empresas, true), 'nuevo'
    )
    returning id into v_candidato;
  else
    update public.talento_candidatos
    set nombre = v_nombre,
        telefono = coalesce(nullif(left(btrim(coalesce(p_telefono, '')), 40), ''), telefono),
        ubicacion = coalesce(nullif(left(btrim(coalesce(p_ubicacion, '')), 120), ''), ubicacion),
        puesto_objetivo = v_puesto,
        seniority = v_seniority,
        modalidad = v_modalidad,
        habilidades = case when cardinality(v_habilidades) > 0 then v_habilidades else habilidades end,
        experiencia = coalesce(nullif(left(btrim(coalesce(p_experiencia, '')), 3000), ''), experiencia),
        educacion = coalesce(nullif(left(btrim(coalesce(p_educacion, '')), 1000), ''), educacion),
        disponibilidad = coalesce(nullif(left(btrim(coalesce(p_disponibilidad, '')), 80), ''), disponibilidad),
        expectativa_salarial = case
          when p_expectativa_salarial is null then expectativa_salarial
          else greatest(p_expectativa_salarial, 0)
        end,
        cv_path = coalesce(v_cv_path, cv_path),
        cv_url = coalesce(v_cv_url, cv_url),
        cv_nombre = coalesce(nullif(left(btrim(coalesce(p_cv_nombre, '')), 180), ''), cv_nombre),
        consentimiento = true,
        visible_empresas = coalesce(p_visible_empresas, visible_empresas),
        updated_at = now()
    where id = v_candidato;
  end if;

  if p_vacante_id is not null then
    select id into v_postulacion
    from public.talento_postulaciones
    where candidato_id = v_candidato and vacante_id = p_vacante_id
    limit 1;

    if v_postulacion is null then
      insert into public.talento_postulaciones (
        candidato_id, empresa_id, vacante_id, etapa, origen
      ) values (
        v_candidato, v_empresa, p_vacante_id, 'recibida', 'publico'
      )
      returning id into v_postulacion;
    else
      v_existente := true;
    end if;
  end if;

  return jsonb_build_object(
    'candidato_id', v_candidato,
    'postulacion_id', v_postulacion,
    'existente', v_existente
  );
end;
$$;

create or replace function public.crear_empresa_y_solicitud(
  p_empresa_nombre text,
  p_sector text,
  p_sitio_web text,
  p_ubicacion text,
  p_contacto_nombre text,
  p_contacto_email text,
  p_contacto_telefono text,
  p_candidato_ids uuid[],
  p_solicitud_tipo text,
  p_mensaje text,
  p_consentimiento boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa uuid;
  v_nombre text := left(btrim(coalesce(p_empresa_nombre, '')), 160);
  v_contacto text := left(btrim(coalesce(p_contacto_nombre, '')), 120);
  v_email text := lower(nullif(left(btrim(coalesce(p_contacto_email, '')), 160), ''));
  v_tipo text := coalesce(nullif(left(btrim(p_solicitud_tipo), 20), ''), 'entrevista');
  v_candidato uuid;
  v_creadas integer := 0;
  v_existentes integer := 0;
begin
  if length(v_nombre) < 2 then
    raise exception 'Escribe el nombre de la empresa.' using errcode = '22023';
  end if;
  if length(v_contacto) < 2 then
    raise exception 'Escribe el nombre del contacto.' using errcode = '22023';
  end if;
  if v_email is null or v_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    raise exception 'El correo del contacto no es válido.' using errcode = '22023';
  end if;
  if p_consentimiento is not true then
    raise exception 'Debes autorizar el uso de los datos.' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_sitio_web, '')), '') is not null
     and btrim(p_sitio_web) !~* '^https?://[^[:space:]]+$' then
    raise exception 'El sitio web no tiene un formato válido.' using errcode = '22023';
  end if;
  if v_tipo not in ('entrevista', 'contratacion') then
    v_tipo := 'entrevista';
  end if;
  if p_candidato_ids is null or cardinality(p_candidato_ids) = 0 or cardinality(p_candidato_ids) > 12 then
    raise exception 'Selecciona entre 1 y 12 candidatos.' using errcode = '22023';
  end if;

  select id into v_empresa
  from public.talento_empresas
  where lower(nombre) = lower(v_nombre)
  limit 1;

  if v_empresa is null then
    insert into public.talento_empresas (
      nombre, sector, sitio_web, ubicacion, contacto_nombre, contacto_email,
      contacto_telefono, estado, consentimiento
    ) values (
      v_nombre,
      nullif(left(btrim(coalesce(p_sector, '')), 120), ''),
      nullif(left(btrim(coalesce(p_sitio_web, '')), 300), ''),
      nullif(left(btrim(coalesce(p_ubicacion, '')), 160), ''),
      v_contacto, v_email,
      nullif(left(btrim(coalesce(p_contacto_telefono, '')), 40), ''),
      'activa', true
    )
    returning id into v_empresa;
  else
    update public.talento_empresas
    set sector = coalesce(nullif(left(btrim(coalesce(p_sector, '')), 120), ''), sector),
        sitio_web = coalesce(nullif(left(btrim(coalesce(p_sitio_web, '')), 300), ''), sitio_web),
        ubicacion = coalesce(nullif(left(btrim(coalesce(p_ubicacion, '')), 160), ''), ubicacion),
        contacto_nombre = v_contacto,
        contacto_email = v_email,
        contacto_telefono = coalesce(nullif(left(btrim(coalesce(p_contacto_telefono, '')), 40), ''), contacto_telefono),
        consentimiento = true,
        updated_at = now()
    where id = v_empresa;
  end if;

  foreach v_candidato in array p_candidato_ids
  loop
    if not exists (
      select 1
      from public.talento_candidatos
      where id = v_candidato
        and visible_empresas = true
        and consentimiento = true
        and estado not in ('descartado', 'contratado')
    ) then
      continue;
    end if;

    if exists (
      select 1
      from public.talento_postulaciones
      where candidato_id = v_candidato
        and empresa_id = v_empresa
        and etapa not in ('contratada', 'rechazada')
    ) then
      v_existentes := v_existentes + 1;
      continue;
    end if;

    insert into public.talento_postulaciones (
      candidato_id, empresa_id, etapa, origen, solicitud_tipo, notas
    ) values (
      v_candidato, v_empresa, 'recibida', 'empresa', v_tipo,
      nullif(left(btrim(coalesce(p_mensaje, '')), 2000), '')
    );
    v_creadas := v_creadas + 1;
  end loop;

  if v_creadas = 0 and v_existentes = 0 then
    raise exception 'Los perfiles seleccionados ya no están disponibles. Elige otros candidatos.'
      using errcode = '22023';
  end if;

  return jsonb_build_object(
    'empresa_id', v_empresa,
    'solicitudes', v_creadas,
    'existentes', v_existentes
  );
end;
$$;

create or replace function public.crear_vacante_publica(
  p_empresa_nombre text,
  p_sector text,
  p_sitio_web text,
  p_ubicacion text,
  p_contacto_nombre text,
  p_contacto_email text,
  p_contacto_telefono text,
  p_titulo text,
  p_descripcion text,
  p_requisitos text,
  p_ubicacion_vacante text,
  p_modalidad text,
  p_seniority text,
  p_tipo_contrato text,
  p_salario_min numeric,
  p_salario_max numeric,
  p_consentimiento boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa uuid;
  v_vacante uuid;
  v_nombre text := left(btrim(coalesce(p_empresa_nombre, '')), 160);
  v_contacto text := left(btrim(coalesce(p_contacto_nombre, '')), 120);
  v_email text := lower(nullif(left(btrim(coalesce(p_contacto_email, '')), 160), ''));
  v_titulo text := left(btrim(coalesce(p_titulo, '')), 180);
  v_descripcion text := left(btrim(coalesce(p_descripcion, '')), 5000);
  v_modalidad text := coalesce(nullif(left(btrim(p_modalidad), 20), ''), 'hibrido');
  v_seniority text := coalesce(nullif(left(btrim(p_seniority), 20), ''), 'mid');
  v_contrato text := coalesce(nullif(left(btrim(p_tipo_contrato), 30), ''), 'tiempo_completo');
begin
  if length(v_nombre) < 2 then
    raise exception 'Escribe el nombre de la empresa.' using errcode = '22023';
  end if;
  if length(v_contacto) < 2 then
    raise exception 'Escribe el nombre del contacto.' using errcode = '22023';
  end if;
  if v_email is null or v_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    raise exception 'El correo del contacto no es válido.' using errcode = '22023';
  end if;
  if length(v_titulo) < 3 then
    raise exception 'Escribe el título de la vacante.' using errcode = '22023';
  end if;
  if length(v_descripcion) < 20 then
    raise exception 'Describe la vacante con un poco más de detalle.' using errcode = '22023';
  end if;
  if p_consentimiento is not true then
    raise exception 'Debes autorizar el uso de los datos.' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_sitio_web, '')), '') is not null
     and btrim(p_sitio_web) !~* '^https?://[^[:space:]]+$' then
    raise exception 'El sitio web no tiene un formato válido.' using errcode = '22023';
  end if;
  if v_modalidad not in ('presencial', 'hibrido', 'remoto', 'flexible') then
    v_modalidad := 'hibrido';
  end if;
  if v_seniority not in ('junior', 'mid', 'senior', 'lead', 'director') then
    v_seniority := 'mid';
  end if;
  if v_contrato not in ('tiempo_completo', 'medio_tiempo', 'contrato', 'temporal', 'practica') then
    v_contrato := 'tiempo_completo';
  end if;
  if p_salario_min is not null and p_salario_max is not null and p_salario_min > p_salario_max then
    raise exception 'El salario mínimo no puede ser mayor que el máximo.' using errcode = '22023';
  end if;

  select id into v_empresa
  from public.talento_empresas
  where lower(nombre) = lower(v_nombre)
  limit 1;

  if v_empresa is null then
    insert into public.talento_empresas (
      nombre, sector, sitio_web, ubicacion, contacto_nombre, contacto_email,
      contacto_telefono, estado, consentimiento
    ) values (
      v_nombre,
      nullif(left(btrim(coalesce(p_sector, '')), 120), ''),
      nullif(left(btrim(coalesce(p_sitio_web, '')), 300), ''),
      nullif(left(btrim(coalesce(p_ubicacion, '')), 160), ''),
      v_contacto, v_email,
      nullif(left(btrim(coalesce(p_contacto_telefono, '')), 40), ''),
      'activa', true
    )
    returning id into v_empresa;
  else
    update public.talento_empresas
    set sector = coalesce(nullif(left(btrim(coalesce(p_sector, '')), 120), ''), sector),
        sitio_web = coalesce(nullif(left(btrim(coalesce(p_sitio_web, '')), 300), ''), sitio_web),
        ubicacion = coalesce(nullif(left(btrim(coalesce(p_ubicacion, '')), 160), ''), ubicacion),
        contacto_nombre = v_contacto,
        contacto_email = v_email,
        contacto_telefono = coalesce(nullif(left(btrim(coalesce(p_contacto_telefono, '')), 40), ''), contacto_telefono),
        consentimiento = true,
        updated_at = now()
    where id = v_empresa;
  end if;

  insert into public.talento_vacantes (
    empresa_id, titulo, descripcion, requisitos, responsabilidades, ubicacion,
    modalidad, seniority, tipo_contrato, salario_min, salario_max, estado, publica
  ) values (
    v_empresa, v_titulo, v_descripcion,
    nullif(left(btrim(coalesce(p_requisitos, '')), 3000), ''),
    null,
    nullif(left(btrim(coalesce(p_ubicacion_vacante, '')), 160), ''),
    v_modalidad, v_seniority, v_contrato,
    case when p_salario_min is null then null else greatest(p_salario_min, 0) end,
    case when p_salario_max is null then null else greatest(p_salario_max, 0) end,
    'abierta', false
  )
  returning id into v_vacante;

  return jsonb_build_object('empresa_id', v_empresa, 'vacante_id', v_vacante);
end;
$$;

-- Las funciones públicas son las únicas ejecutables por anon.
do $$
declare
  firma regprocedure;
begin
  for firma in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'listar_vacantes_publicas',
        'listar_candidatos_publicos',
        'crear_postulacion_publica',
        'crear_empresa_y_solicitud',
        'crear_vacante_publica'
      )
  loop
    execute format('revoke all on function %s from public', firma);
    execute format('grant execute on function %s to anon, authenticated', firma);
  end loop;
end $$;

-- Refresca la caché de PostgREST para que las RPC nuevas estén disponibles de inmediato.
notify pgrst, 'reload schema';
