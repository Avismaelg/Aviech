-- AviTech Panel · Migración 011: postulación asistida con IA
-- El candidato autoriza que la IA revise las vacantes públicas abiertas y
-- postule su perfil a las que mejor encajan. El token privado es la prueba de
-- que quien solicita la postulación acaba de crear o actualizar ese perfil.
--
-- Se aplica automáticamente con el workflow "Migrar base de datos" de GitHub,
-- o a mano: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: puede ejecutarse varias veces sin romper nada.

-- 1) Token privado del candidato. No se devuelve en las RPC de listado público:
--    solo se entrega al crear o actualizar el perfil y sirve para la IA.
alter table public.talento_candidatos add column if not exists token_publico uuid;

update public.talento_candidatos
set token_publico = gen_random_uuid()
where token_publico is null;

alter table public.talento_candidatos alter column token_publico set default gen_random_uuid();
alter table public.talento_candidatos alter column token_publico set not null;

create unique index if not exists talento_candidatos_token_publico_idx
  on public.talento_candidatos (token_publico);

-- 2) Misma alta pública de siempre, pero ahora devuelve el token que la IA
--    necesita. El token no se expone en el portal ni en la lista de candidatos.
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
  v_token uuid;
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

  select id, token_publico into v_candidato, v_token
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
    returning id, token_publico into v_candidato, v_token;
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
    'token_publico', v_token,
    'postulacion_id', v_postulacion,
    'existente', v_existente
  );
end;
$$;

-- 3) Perfil mínimo para el matching. No incluye nombre, correo, teléfono ni CV:
--    la IA no necesita datos de contacto para recomendar vacantes.
create or replace function public.perfil_para_ia_publico(
  p_candidato_id uuid,
  p_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
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
  from public.talento_candidatos c
  where c.id = p_candidato_id
    and c.token_publico = p_token
    and c.consentimiento = true
    and c.estado not in ('descartado', 'contratado')
  limit 1;
$$;

-- 4) Crea las postulaciones que eligió la IA. Valida el token, que la vacante
--    siga abierta y pública, y evita duplicados. Máximo 3 por llamada.
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

-- 5) Permisos: solo estas RPC públicas pueden ejecutar anon y authenticated.
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
        'crear_postulacion_publica',
        'perfil_para_ia_publico',
        'postular_con_ia_publica'
      )
  loop
    execute format('revoke all on function %s from public', firma);
    execute format('grant execute on function %s to anon, authenticated', firma);
  end loop;
end $$;

notify pgrst, 'reload schema';
