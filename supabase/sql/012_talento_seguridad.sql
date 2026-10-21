-- AviTech Panel · Migración 012: seguridad y límites del portal de Talento
-- =========================================================================
-- 1) Evita la suplantación de perfiles: para actualizar un perfil existente
--    hace falta el token privado que el portal guarda en el navegador de
--    quien lo creó. El alta nueva sigue funcionando igual.
-- 2) Pone límites de uso en la propia base. Antes solo el Worker limitaba
--    por IP; quien llamara las RPC públicas directamente con la clave
--    publicable podía saltárselos. Ahora el límite vive en la base.
-- 3) Índices para las listas públicas y para los procesos del panel.
--
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

-- ---------------------------------------------------------------- límites

create table if not exists public.talento_limites_publicos (
  clave text primary key,
  contador integer not null default 0,
  expira timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.talento_limites_publicos enable row level security;
revoke all on public.talento_limites_publicos from anon, authenticated;

-- Cuenta un intento y responde true mientras esté dentro del límite.
-- No es ejecutable por anon/authenticated: solo la usan las RPC de abajo.
create or replace function public.talento_limitar_publico(
  p_clave text,
  p_maximo integer,
  p_segundos integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clave text := left(btrim(coalesce(p_clave, '')), 200);
  v_contador integer;
begin
  if v_clave = '' or p_maximo is null or p_maximo < 1 or p_segundos is null or p_segundos < 1 then
    raise exception 'Límite público mal configurado.' using errcode = '22023';
  end if;

  insert into public.talento_limites_publicos as limites (clave, contador, expira, updated_at)
  values (v_clave, 1, now() + make_interval(secs => p_segundos), now())
  on conflict (clave) do update
    set contador = case
          when limites.expira < now() then 1
          else limites.contador + 1
        end,
        expira = case
          when limites.expira < now() then now() + make_interval(secs => p_segundos)
          else limites.expira
        end,
        updated_at = now()
  returning contador into v_contador;

  -- Limpieza oportunista: no hace falta un cron para esto.
  if random() < 0.02 then
    delete from public.talento_limites_publicos where expira < now() - interval '2 days';
  end if;

  return v_contador <= p_maximo;
end;
$$;

revoke all on function public.talento_limitar_publico(text, integer, integer)
  from public, anon, authenticated;

-- ----------------------------------------------- listas públicas con límite
-- Mismo resultado que la versión de 010, pero con un tope global para que
-- nadie pueda martillar la base llamando las RPC directo con la clave
-- publicable. El tope es alto: solo protege contra abuso, no contra visitas.

create or replace function public.listar_vacantes_publicas()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resultado jsonb;
begin
  if not public.talento_limitar_publico('talento:lectura:vacantes:1h', 3000, 3600) then
    raise exception 'El portal está recibiendo muchas visitas. Espera un momento e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;

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
  into v_resultado
  from (
    select *
    from public.talento_vacantes
    where estado = 'abierta' and publica = true
    order by created_at desc
    limit 60
  ) v
  join public.talento_empresas e on e.id = v.empresa_id;

  return coalesce(v_resultado, '[]'::jsonb);
end;
$$;

create or replace function public.listar_candidatos_publicos()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resultado jsonb;
begin
  if not public.talento_limitar_publico('talento:lectura:candidatos:1h', 3000, 3600) then
    raise exception 'El portal está recibiendo muchas visitas. Espera un momento e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;

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
  into v_resultado
  from (
    select *
    from public.talento_candidatos
    where visible_empresas = true
      and consentimiento = true
      and estado not in ('descartado', 'contratado')
    order by created_at desc
    limit 100
  ) c;

  return coalesce(v_resultado, '[]'::jsonb);
end;
$$;

-- ------------------------------------------ perfil público con token privado
-- Sustituye a crear_postulacion_publica. El alta nueva se comporta igual;
-- si el correo ya existe, solo deja actualizar a quien traiga el token
-- privado guardado en su navegador. Sin token, devuelve PT409 para que el
-- portal explique qué pasó sin revelar datos del perfil.

create or replace function public.guardar_postulacion_publica(
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
  p_vacante_id uuid default null,
  p_token_publico uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidato uuid;
  v_token uuid;
  v_postulacion uuid;
  v_empresa uuid;
  v_existente boolean := false;
  v_perfil_existente boolean := false;
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

  if not public.talento_limitar_publico('talento:perfil:global:1h', 150, 3600) then
    raise exception 'Estamos recibiendo muchos perfiles nuevos. Espera unos minutos e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;
  if not public.talento_limitar_publico('talento:perfil:' || md5(v_email), 8, 3600) then
    raise exception 'Ya recibimos varias solicitudes con este correo. Espera una hora e inténtalo otra vez.'
      using errcode = 'PT429';
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

  select id, token_publico into v_candidato, v_token
  from public.talento_candidatos
  where lower(email) = v_email
  limit 1;

  if v_candidato is not null then
    v_perfil_existente := true;

    -- Sin el token del navegador no se toca el perfil de otra persona.
    if p_token_publico is null or v_token is null or p_token_publico <> v_token then
      raise exception 'perfil_existente' using errcode = 'PT409';
    end if;

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
  else
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
    returning id, token_publico into v_candidato, v_token;
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
    'token_publico', v_token,
    'postulacion_id', v_postulacion,
    'existente', v_existente,
    'perfil_existente', v_perfil_existente
  );
end;
$$;

-- La función anterior queda reemplazada por completo. Se elimina la vieja
-- para que nadie pueda actualizar perfiles sin token llamándola directo.
drop function if exists public.crear_postulacion_publica(
  text, text, text, text, text, text, text, text[], text, text, text,
  numeric, text, text, text, boolean, boolean, uuid
);

-- ------------------------------------ solicitudes de empresas con límites
-- Misma lógica que 010, más topes de uso.

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

  if not public.talento_limitar_publico('talento:empresa:global:1h', 80, 3600) then
    raise exception 'Estamos recibiendo muchas solicitudes de empresas. Espera unos minutos e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;
  if not public.talento_limitar_publico('talento:empresa:' || md5(v_email), 5, 3600) then
    raise exception 'Ya recibimos varias solicitudes con este correo. Espera una hora e inténtalo otra vez.'
      using errcode = 'PT429';
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

-- --------------------------------------- vacantes propuestas con límites

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

  if not public.talento_limitar_publico('talento:vacante:global:1h', 80, 3600) then
    raise exception 'Estamos recibiendo muchas vacantes nuevas. Espera unos minutos e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;
  if not public.talento_limitar_publico('talento:vacante:' || md5(v_email), 5, 3600) then
    raise exception 'Ya recibimos varias vacantes con este correo. Espera una hora e inténtalo otra vez.'
      using errcode = 'PT429';
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

-- ------------------------------------------------------- IA pública
-- Mismo comportamiento que 011, con topes para que un token filtrado no
-- pueda usarse para martillar la IA ni la base.

create or replace function public.perfil_para_ia_publico(
  p_candidato_id uuid,
  p_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resultado jsonb;
begin
  if p_candidato_id is null or p_token is null then
    return null;
  end if;

  if not public.talento_limitar_publico('talento:ia:perfil:' || p_candidato_id::text, 30, 3600) then
    raise exception 'La IA está recibiendo muchas solicitudes. Espera unos minutos e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;

  select jsonb_build_object(
    'id', c.id,
    'puesto_objetivo', c.puesto_objetivo,
    'seniority', c.seniority,
    'modalidad', c.modalidad,
    'ubicacion', c.ubicacion,
    'habilidades', c.habilidades,
    'experiencia', left(coalesce(c.experiencia, ''), 1800),
    'educacion', left(coalesce(c.educacion, ''), 800),
    'disponibilidad', c.disponibilidad,
    'expectativa_salarial', c.expectativa_salarial,
    'postuladas', coalesce((
      select jsonb_agg(p.vacante_id)
      from public.talento_postulaciones p
      where p.candidato_id = c.id and p.vacante_id is not null
    ), '[]'::jsonb)
  )
  into v_resultado
  from public.talento_candidatos c
  where c.id = p_candidato_id
    and c.token_publico = p_token
    and c.consentimiento = true
    and c.estado not in ('descartado', 'contratado')
  limit 1;

  return v_resultado;
end;
$$;

create or replace function public.postular_con_ia_publica(
  p_candidato_id uuid,
  p_token uuid,
  p_vacante_ids uuid[],
  p_puntajes integer[],
  p_motivos text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidato uuid;
  v_vacante uuid;
  v_empresa uuid;
  v_postulacion uuid;
  v_creadas integer := 0;
  v_existentes integer := 0;
  v_aplicadas uuid[] := '{}';
  v_total integer;
  i integer;
begin
  if p_vacante_ids is null or cardinality(p_vacante_ids) = 0 or cardinality(p_vacante_ids) > 3 then
    raise exception 'La IA debe postular entre 1 y 3 vacantes.' using errcode = '22023';
  end if;

  select id into v_candidato
  from public.talento_candidatos
  where id = p_candidato_id
    and token_publico = p_token
    and consentimiento = true
    and estado not in ('descartado', 'contratado')
  limit 1;

  if v_candidato is null then
    raise exception 'No encontramos tu perfil o la autorización venció.' using errcode = '22023';
  end if;

  if not public.talento_limitar_publico('talento:ia:global:1h', 60, 3600) then
    raise exception 'La IA está recibiendo muchas solicitudes. Espera unos minutos e inténtalo otra vez.'
      using errcode = 'PT429';
  end if;
  if not public.talento_limitar_publico('talento:ia:postular:' || v_candidato::text, 6, 3600) then
    raise exception 'Ya pediste varias búsquedas con IA. Espera una hora y vuelve a intentarlo.'
      using errcode = 'PT429';
  end if;

  v_total := cardinality(p_vacante_ids);
  for i in 1..v_total loop
    v_vacante := p_vacante_ids[i];
    if v_vacante is null then
      continue;
    end if;

    select empresa_id into v_empresa
    from public.talento_vacantes
    where id = v_vacante and estado = 'abierta' and publica = true;

    if v_empresa is null then
      continue;
    end if;

    select id into v_postulacion
    from public.talento_postulaciones
    where candidato_id = v_candidato and vacante_id = v_vacante
    limit 1;

    if v_postulacion is not null then
      v_existentes := v_existentes + 1;
      continue;
    end if;

    insert into public.talento_postulaciones (
      candidato_id,
      empresa_id,
      vacante_id,
      etapa,
      origen,
      match_score,
      match_motivo,
      notas
    ) values (
      v_candidato,
      v_empresa,
      v_vacante,
      'recibida',
      'ia',
      least(100, greatest(0, coalesce(p_puntajes[i], 0))),
      nullif(left(btrim(coalesce(p_motivos[i], '')), 500), ''),
      'Postulación asistida por IA a petición del candidato.'
    )
    returning id into v_postulacion;

    v_creadas := v_creadas + 1;
    v_aplicadas := array_append(v_aplicadas, v_vacante);
  end loop;

  return jsonb_build_object(
    'aplicadas', v_creadas,
    'existentes', v_existentes,
    'vacantes', to_jsonb(v_aplicadas)
  );
end;
$$;

-- ---------------------------------------------------------------- índices
-- Las listas públicas ordenan por fecha; los índices parciales evitan que
-- Postgres recorra toda la tabla cuando el portal tenga miles de registros.

create index if not exists talento_vacantes_publicas_idx
  on public.talento_vacantes (created_at desc)
  where estado = 'abierta' and publica = true;

create index if not exists talento_candidatos_publicos_idx
  on public.talento_candidatos (created_at desc)
  where visible_empresas = true and consentimiento = true
    and estado not in ('descartado', 'contratado');

create index if not exists talento_postulaciones_created_idx
  on public.talento_postulaciones (created_at desc);

-- ---------------------------------------------------------------- permisos
-- Solo estas RPC las pueden ejecutar anon y authenticated. La función de
-- límites queda fuera a propósito.

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
        'guardar_postulacion_publica',
        'listar_vacantes_publicas',
        'listar_candidatos_publicos',
        'crear_empresa_y_solicitud',
        'crear_vacante_publica',
        'perfil_para_ia_publico',
        'postular_con_ia_publica'
      )
  loop
    execute format('revoke all on function %s from public', firma);
    execute format('grant execute on function %s to anon, authenticated', firma);
  end loop;
end $$;

-- Refresca la caché de PostgREST para que las RPC nuevas estén disponibles de inmediato.
notify pgrst, 'reload schema';
