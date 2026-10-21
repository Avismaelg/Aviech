async (page) => {
  const BASE = 'http://localhost:5181'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-talento'
  const CLAVE = 'sb-ktvyhtbmokmrzeuibznv-auth-token'

  const ahora = Math.floor(Date.now() / 1000)
  const ahoraISO = () => new Date().toISOString()
  const enDosDias = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  const sesion = {
    access_token: 'token-de-prueba',
    token_type: 'bearer',
    expires_in: 604800,
    expires_at: ahora + 604800,
    refresh_token: 'refresh-de-prueba',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'prueba@avitech.do',
      email_confirmed_at: ahoraISO(),
      confirmed_at: ahoraISO(),
      last_sign_in_at: ahoraISO(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { nombre: 'Prueba' },
      identities: [],
      created_at: ahoraISO(),
      updated_at: ahoraISO(),
      is_anonymous: false,
    },
  }

  let contador = 100
  const nuevoId = (prefijo) => `${prefijo}-${++contador}`

  const store = {
    talento_candidatos: [
      {
        id: 'cand-1',
        nombre: 'Ana Pérez',
        email: 'ana@correo.com',
        telefono: '809 555 0101',
        ubicacion: 'Santo Domingo',
        puesto_objetivo: 'Contadora senior',
        seniority: 'senior',
        modalidad: 'hibrido',
        habilidades: ['NIIF', 'Excel', 'Auditoría'],
        experiencia: 'Ocho años en cierre contable, auditoría y reportes para grupos empresariales.',
        educacion: 'Licenciatura en Contabilidad',
        disponibilidad: '2_semanas',
        expectativa_salarial: 85000,
        cv_path: 'publico/ana-perez.pdf',
        cv_url: null,
        cv_nombre: 'ana-perez.pdf',
        estado: 'nuevo',
        visible_empresas: true,
        consentimiento: true,
        notas: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: 'cand-2',
        nombre: 'Luis Medina',
        email: 'luis@correo.com',
        telefono: '809 555 0202',
        ubicacion: 'Santiago',
        puesto_objetivo: 'Analista financiero',
        seniority: 'mid',
        modalidad: 'remoto',
        habilidades: ['Power BI', 'Presupuestos', 'SQL'],
        experiencia: 'Cinco años construyendo modelos financieros y tableros de control.',
        educacion: 'Economía',
        disponibilidad: 'inmediata',
        expectativa_salarial: 65000,
        cv_path: null,
        cv_url: 'https://ejemplo.com/cv-luis',
        cv_nombre: null,
        estado: 'evaluando',
        visible_empresas: true,
        consentimiento: true,
        notas: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: 'cand-3',
        nombre: 'Carla Rojas',
        email: 'carla@correo.com',
        telefono: '829 555 0303',
        ubicacion: 'Santo Domingo',
        puesto_objetivo: 'Especialista en nómina',
        seniority: 'senior',
        modalidad: 'presencial',
        habilidades: ['Nómina', 'TSS', 'IR-17'],
        experiencia: 'Siete años procesando nómina para empresas de 300 colaboradores.',
        educacion: 'Contabilidad',
        disponibilidad: '1_mes',
        expectativa_salarial: 72000,
        cv_path: null,
        cv_url: null,
        cv_nombre: null,
        estado: 'entrevista',
        visible_empresas: true,
        consentimiento: true,
        notas: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
    ],
    talento_empresas: [
      {
        id: 'emp-1',
        nombre: 'Grupo del Norte SRL',
        sector: 'Retail',
        sitio_web: 'https://grupodelnorte.do',
        ubicacion: 'Santo Domingo',
        contacto_nombre: 'María Santos',
        contacto_email: 'rrhh@grupodelnorte.do',
        contacto_telefono: '809 555 1000',
        estado: 'activa',
        consentimiento: true,
        notas: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: 'emp-2',
        nombre: 'Caribe Legal',
        sector: 'Servicios legales',
        sitio_web: null,
        ubicacion: 'Santiago',
        contacto_nombre: 'José Almonte',
        contacto_email: 'talento@caribelelegal.do',
        contacto_telefono: null,
        estado: 'prospecto',
        consentimiento: true,
        notas: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
    ],
    talento_vacantes: [
      {
        id: 'vac-1',
        empresa_id: 'emp-1',
        titulo: 'Analista contable senior',
        descripcion: 'Buscamos una persona para liderar el cierre contable mensual y los reportes de la operación.',
        requisitos: 'Contabilidad, NIIF y Excel avanzado. Experiencia mínima de cinco años.',
        responsabilidades: 'Cierre mensual, conciliaciones y reportes a la gerencia.',
        ubicacion: 'Santo Domingo',
        modalidad: 'hibrido',
        seniority: 'senior',
        tipo_contrato: 'tiempo_completo',
        salario_min: 70000,
        salario_max: 95000,
        estado: 'abierta',
        publica: true,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: 'vac-2',
        empresa_id: 'emp-2',
        titulo: 'Asistente legal',
        descripcion: 'Apoyo en contratos, expedientes y atención a clientes corporativos.',
        requisitos: 'Estudiante de derecho o recién graduado.',
        responsabilidades: null,
        ubicacion: 'Santiago',
        modalidad: 'presencial',
        seniority: 'junior',
        tipo_contrato: 'medio_tiempo',
        salario_min: 35000,
        salario_max: 45000,
        estado: 'borrador',
        publica: false,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
    ],
    talento_postulaciones: [
      {
        id: 'post-1',
        candidato_id: 'cand-1',
        empresa_id: 'emp-1',
        vacante_id: 'vac-1',
        etapa: 'recibida',
        origen: 'publico',
        solicitud_tipo: null,
        match_score: null,
        match_motivo: null,
        notas: null,
        fecha_entrevista: null,
        entrevista_tipo: null,
        entrevistador: null,
        resultado_entrevista: null,
        fecha_inicio: null,
        salario_final: null,
        comision: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: 'post-2',
        candidato_id: 'cand-2',
        empresa_id: 'emp-1',
        vacante_id: 'vac-1',
        etapa: 'entrevista',
        origen: 'empresa',
        solicitud_tipo: 'entrevista',
        match_score: null,
        match_motivo: null,
        notas: 'La empresa pidió una entrevista virtual.',
        fecha_entrevista: enDosDias,
        entrevista_tipo: 'virtual',
        entrevistador: 'María Santos',
        resultado_entrevista: null,
        fecha_inicio: null,
        salario_final: null,
        comision: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: 'post-3',
        candidato_id: 'cand-3',
        empresa_id: 'emp-2',
        vacante_id: 'vac-2',
        etapa: 'oferta',
        origen: 'interno',
        solicitud_tipo: null,
        match_score: 88,
        match_motivo: 'Encaja con el perfil legal junior y la modalidad presencial.',
        notas: null,
        fecha_entrevista: null,
        entrevista_tipo: null,
        entrevistador: null,
        resultado_entrevista: null,
        fecha_inicio: null,
        salario_final: null,
        comision: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
    ],
  }

  // El portal guarda un token por correo. La prueba simula la misma regla
  // que la base: sin token válido no se actualiza un perfil existente.
  const tokensPorCorreo = new Map()
  for (const candidato of store.talento_candidatos) {
    if (candidato.email) {
      tokensPorCorreo.set(
        String(candidato.email).toLowerCase(),
        candidato.token_publico || '00000000-0000-4000-8000-000000000001',
      )
    }
  }

  const buscar = (tabla, id) => store[tabla]?.find((fila) => fila.id === id) ?? null
  const empresa = (id) => {
    const fila = buscar('talento_empresas', id)
    return fila ? { id: fila.id, nombre: fila.nombre, sector: fila.sector } : null
  }
  const candidatoCorto = (id) => {
    const fila = buscar('talento_candidatos', id)
    return fila
      ? {
          id: fila.id,
          nombre: fila.nombre,
          email: fila.email,
          telefono: fila.telefono,
          puesto_objetivo: fila.puesto_objetivo,
          seniority: fila.seniority,
          modalidad: fila.modalidad,
          ubicacion: fila.ubicacion,
          habilidades: fila.habilidades,
          disponibilidad: fila.disponibilidad,
          expectativa_salarial: fila.expectativa_salarial,
          cv_path: fila.cv_path,
          cv_url: fila.cv_url,
          cv_nombre: fila.cv_nombre,
        }
      : null
  }
  const vacanteCorta = (id) => {
    const fila = buscar('talento_vacantes', id)
    return fila ? { id: fila.id, titulo: fila.titulo } : null
  }
  const enriquecer = (tabla, fila) => {
    if (tabla === 'talento_vacantes') return { ...fila, talento_empresas: empresa(fila.empresa_id) }
    if (tabla === 'talento_postulaciones') {
      return {
        ...fila,
        talento_candidatos: candidatoCorto(fila.candidato_id),
        talento_empresas: empresa(fila.empresa_id),
        talento_vacantes: vacanteCorta(fila.vacante_id),
      }
    }
    return { ...fila }
  }

  const nombrePublico = (nombre) => {
    const partes = nombre.trim().split(/\s+/)
    return partes.length > 1 ? `${partes[0]} ${partes[1].charAt(0)}.` : partes[0]
  }
  const vacantePublica = (fila) => {
    const empresaFila = buscar('talento_empresas', fila.empresa_id)
    return {
      id: fila.id,
      titulo: fila.titulo,
      empresa_nombre: empresaFila?.nombre ?? 'Empresa',
      sector: empresaFila?.sector ?? null,
      ubicacion: fila.ubicacion,
      modalidad: fila.modalidad,
      seniority: fila.seniority,
      tipo_contrato: fila.tipo_contrato,
      salario_min: fila.salario_min,
      salario_max: fila.salario_max,
      descripcion: fila.descripcion,
      requisitos: fila.requisitos,
      created_at: fila.created_at,
    }
  }
  const candidatoPublico = (fila) => ({
    id: fila.id,
    nombre_publico: nombrePublico(fila.nombre),
    puesto_objetivo: fila.puesto_objetivo,
    seniority: fila.seniority,
    modalidad: fila.modalidad,
    ubicacion: fila.ubicacion,
    habilidades: fila.habilidades,
    experiencia: (fila.experiencia ?? '').slice(0, 320),
    disponibilidad: fila.disponibilidad,
    expectativa_salarial: fila.expectativa_salarial,
    cv_disponible: Boolean(fila.cv_path || fila.cv_url),
    created_at: fila.created_at,
  })

  const cabecerasCors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': '*',
    'access-control-expose-headers': '*',
    'access-control-max-age': '86400',
  }
  const cabecerasJson = { ...cabecerasCors, 'content-type': 'application/json' }

  await page.route('**/auth/v1/**', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    const url = peticion.url()
    if (url.includes('/user')) return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(sesion.user) })
    if (url.includes('/token')) return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(sesion) })
    if (url.includes('/logout')) return ruta.fulfill({ status: 204, headers: cabecerasCors })
    return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '{}' })
  })

  await page.route('**/rest/v1/**', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    const url = new URL(peticion.url())
    const tabla = url.pathname.split('/rest/v1/')[1].split('/')[0]
    const datos = store[tabla]
    if (!datos) return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '[]' })

    if (peticion.method() === 'GET') {
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify(datos.map((fila) => enriquecer(tabla, fila))),
      })
    }
    if (peticion.method() === 'POST') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const fila = { id: nuevoId(tabla), created_at: ahoraISO(), updated_at: ahoraISO(), ...cuerpo }
      datos.push(fila)
      const aceptaObjeto = (peticion.headers()['accept'] || '').includes('vnd.pgrst.object')
      return ruta.fulfill({
        status: 201,
        headers: cabecerasJson,
        body: JSON.stringify(aceptaObjeto ? enriquecer(tabla, fila) : [enriquecer(tabla, fila)]),
      })
    }
    if (peticion.method() === 'PATCH') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const id = (url.searchParams.get('id') || '').replace('eq.', '')
      const fila = datos.find((otra) => otra.id === id)
      if (fila) {
        Object.assign(fila, cuerpo, { updated_at: ahoraISO() })
      }
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(fila ? [enriquecer(tabla, fila)] : []) })
    }
    if (peticion.method() === 'DELETE') {
      const id = (url.searchParams.get('id') || '').replace('eq.', '')
      const indice = datos.findIndex((otra) => otra.id === id)
      if (indice >= 0) datos.splice(indice, 1)
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '[]' })
    }
    return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '[]' })
  })

  await page.route('**/storage/v1/**', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    if (peticion.url().includes('/object/sign/')) {
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify({ signedURL: '/storage/v1/object/sign/talento-cv/prueba.pdf?token=prueba' }),
      })
    }
    if (peticion.method() === 'POST' && peticion.url().includes('/object/list/')) {
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify([
          {
            name: 'prueba.pdf',
            id: 'archivo-1',
            updated_at: ahoraISO(),
            created_at: ahoraISO(),
            last_accessed_at: ahoraISO(),
            metadata: null,
          },
        ]),
      })
    }
    if (peticion.method() === 'DELETE') {
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify([]) })
    }
    return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify({ Key: 'publico/prueba.pdf' }) })
  })

  const peticionesPublicas = []
  await page.route('**/api/talento/**', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    const url = new URL(peticion.url())
    const camino = url.pathname
    if (peticion.method() === 'GET' && camino === '/api/talento/vacantes') {
      const vacantes = store.talento_vacantes
        .filter((fila) => fila.estado === 'abierta' && fila.publica)
        .map(vacantePublica)
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify({ ok: true, vacantes }) })
    }
    if (peticion.method() === 'GET' && camino === '/api/talento/candidatos') {
      const candidatos = store.talento_candidatos
        .filter(
          (fila) =>
            fila.visible_empresas &&
            fila.consentimiento &&
            !['descartado', 'contratado'].includes(fila.estado),
        )
        .map(candidatoPublico)
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify({ ok: true, candidatos }) })
    }
    if (peticion.method() === 'POST' && camino === '/api/talento/match') {
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify({
          ok: true,
          total_evaluados: 1,
          sugerencias: [
            {
              candidato_id: 'cand-3',
              nombre: 'Carla Rojas',
              puntaje: 92,
              motivo: 'Su experiencia en nómina y TSS encaja con el cierre contable y los reportes.',
            },
          ],
        }),
      })
    }
    if (peticion.method() === 'POST' && camino === '/api/talento/solicitudes') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      peticionesPublicas.push({ tipo: 'solicitud', cuerpo })
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify({
          ok: true,
          empresa_id: 'emp-1',
          solicitudes: cuerpo.candidato_ids?.length ?? 0,
          existentes: 0,
          mensaje: 'Recibimos la solicitud.',
        }),
      })
    }
    if (peticion.method() === 'POST' && camino === '/api/talento/postulaciones') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      peticionesPublicas.push({ tipo: 'postulacion', cuerpo })
      const email = String(cuerpo.email || '').toLowerCase()
      const existente = store.talento_candidatos.find(
        (fila) => String(fila.email || '').toLowerCase() === email,
      )

      if (existente) {
        const tokenGuardado = tokensPorCorreo.get(email)
        if (!cuerpo.token_publico || cuerpo.token_publico !== tokenGuardado) {
          return ruta.fulfill({
            status: 409,
            headers: cabecerasJson,
            body: JSON.stringify({
              error: 'Ese correo ya tiene un perfil creado desde otro navegador.',
              codigo: 'perfil_existente',
            }),
          })
        }
        Object.assign(existente, {
          nombre: cuerpo.nombre,
          telefono: cuerpo.telefono || existente.telefono,
          ubicacion: cuerpo.ubicacion || existente.ubicacion,
          puesto_objetivo: cuerpo.puesto_objetivo,
          habilidades:
            Array.isArray(cuerpo.habilidades) && cuerpo.habilidades.length > 0
              ? cuerpo.habilidades
              : existente.habilidades,
          cv_path: cuerpo.cv_path || existente.cv_path,
          cv_nombre: cuerpo.cv_nombre || existente.cv_nombre,
          updated_at: ahoraISO(),
        })
        return ruta.fulfill({
          status: 200,
          headers: cabecerasJson,
          body: JSON.stringify({
            ok: true,
            candidato_id: existente.id,
            token_publico: tokenGuardado,
            postulacion_id: null,
            existente: false,
            perfil_existente: true,
            mensaje: 'Recibimos tu perfil.',
          }),
        })
      }

      const id = nuevoId('talento_candidatos')
      const token = '00000000-0000-4000-8000-000000000011'
      tokensPorCorreo.set(email, token)
      store.talento_candidatos.push({
        id,
        nombre: cuerpo.nombre,
        email: cuerpo.email,
        telefono: cuerpo.telefono || null,
        ubicacion: cuerpo.ubicacion || null,
        puesto_objetivo: cuerpo.puesto_objetivo,
        seniority: cuerpo.seniority || 'mid',
        modalidad: cuerpo.modalidad || 'hibrido',
        habilidades: cuerpo.habilidades || [],
        experiencia: cuerpo.experiencia || null,
        educacion: cuerpo.educacion || null,
        disponibilidad: cuerpo.disponibilidad || null,
        expectativa_salarial: cuerpo.expectativa_salarial ?? null,
        cv_path: cuerpo.cv_path || null,
        cv_url: cuerpo.cv_url || null,
        cv_nombre: cuerpo.cv_nombre || null,
        estado: 'nuevo',
        visible_empresas: cuerpo.visible_empresas !== false,
        consentimiento: true,
        notas: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      })
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify({
          ok: true,
          candidato_id: id,
          token_publico: token,
          postulacion_id: null,
          existente: false,
          perfil_existente: false,
          mensaje: 'Recibimos tu perfil.',
        }),
      })
    }
    if (peticion.method() === 'POST' && camino === '/api/talento/ia-postular') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      peticionesPublicas.push({ tipo: 'ia', cuerpo })
      const vacante = buscar('talento_vacantes', 'vac-1')
      store.talento_postulaciones.push({
        id: nuevoId('talento_postulaciones'),
        candidato_id: cuerpo.candidato_id,
        empresa_id: vacante.empresa_id,
        vacante_id: vacante.id,
        etapa: 'recibida',
        origen: 'ia',
        solicitud_tipo: null,
        match_score: 91,
        match_motivo: 'Su experiencia contable y su expectativa salarial encajan con la vacante.',
        notas: 'Postulación asistida por IA a petición del candidato.',
        fecha_entrevista: null,
        entrevista_tipo: null,
        entrevistador: null,
        resultado_entrevista: null,
        fecha_inicio: null,
        salario_final: null,
        comision: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      })
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify({
          ok: true,
          analizadas: 1,
          existentes: 0,
          aplicadas: [
            {
              vacante_id: 'vac-1',
              titulo: vacante.titulo,
              empresa_nombre: 'Grupo del Norte SRL',
              puntaje: 91,
              motivo: 'Su experiencia contable y su expectativa salarial encajan con la vacante.',
            },
          ],
          mensaje: 'La IA postuló tu perfil a 1 vacante.',
        }),
      })
    }
    if (peticion.method() === 'POST' && camino === '/api/talento/vacantes/publicar') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      peticionesPublicas.push({ tipo: 'vacante', cuerpo })
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify({ ok: true, empresa_id: 'emp-1', vacante_id: 'vac-publica', mensaje: 'Recibimos la vacante.' }),
      })
    }
    return ruta.fulfill({ status: 404, headers: cabecerasJson, body: JSON.stringify({ error: 'No encontrado.' }) })
  })

  const errores = []
  // El rechazo intencional del perfil ajeno sin token responde 409 y el navegador
  // lo anota como error de consola. Se descuenta una sola vez, justo cuando se
  // provoca, para que la regla de «0 errores» siga siendo estricta con lo demás.
  let conflictosEsperados = 0
  page.on('console', (mensaje) => {
    if (mensaje.type() !== 'error') return
    const texto = mensaje.text()
    if (conflictosEsperados > 0 && texto.includes('409')) {
      conflictosEsperados -= 1
      return
    }
    errores.push(`console: ${texto}`)
  })
  page.on('pageerror', (error) => errores.push(`pageerror: ${String(error)}`))

  const pasos = []
  const marcar = (nombre) => pasos.push(nombre)
  const afirmar = (condicion, mensaje) => {
    if (!condicion) throw new Error(`FALLÓ: ${mensaje}`)
  }

  await page.addInitScript(
    ({ clave, valor }) => {
      try {
        window.localStorage.setItem(clave, JSON.stringify(valor))
      } catch {
        // about:blank bloquea localStorage; no pasa nada, en la app sí se guarda.
      }
    },
    { clave: CLAVE, valor: sesion },
  )
  await page.setViewportSize({ width: 1600, height: 1000 })
  // La versión del service worker puede cambiar entre ejecuciones y recargar la
  // página en medio de la prueba. Se retira antes de empezar para que el recorrido
  // mida la interfaz, no la actualización de la PWA.
  await page.goto(`${BASE}/talento`, { waitUntil: 'domcontentloaded' }).catch(() => {})
  await page.waitForLoadState('networkidle').catch(() => {})
  await page
    .evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registros = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registros.map((registro) => registro.unregister()))
      }
      if ('caches' in window) {
        const claves = await caches.keys()
        await Promise.all(claves.map((clave) => caches.delete(clave)))
      }
    })
    .catch(() => {})
  await page.goto('about:blank')

  const ejecutar = async () => {
    errores.length = 0
    await page.goto(`${BASE}/#talento`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Talento', exact: true }).waitFor({ timeout: 20000 })
    marcar('panel de talento cargado')

    afirmar((await page.getByText('Candidatos activos', { exact: true }).count()) >= 1, 'métrica de candidatos')
    afirmar((await page.getByText('3', { exact: true }).count()) >= 1, 'tres candidatos activos')
    afirmar((await page.getByText('Próximas entrevistas', { exact: true }).count()) >= 1, 'próximas entrevistas')
    await page.screenshot({ path: `${CAPTURAS}/01-resumen.png`, fullPage: true })

    await page.getByRole('tab', { name: /^Candidatos/ }).click()
    await page.getByText('Ana Pérez', { exact: true }).waitFor()
    await page.getByRole('button', { name: /Ana Pérez/ }).first().click()
    await page.getByRole('heading', { name: 'Ana Pérez', exact: true }).waitFor()
    afirmar((await page.getByText('ana@correo.com', { exact: true }).count()) >= 1, 'el panel sí muestra el correo')
    await page.getByRole('button', { name: 'Cerrar', exact: true }).last().click()

    await page.getByRole('button', { name: 'Nuevo candidato', exact: true }).click()
    await page.getByRole('heading', { name: 'Nuevo candidato', exact: true }).waitFor()
    await page.getByLabel('Nombre completo *').fill('Marta Gómez')
    await page.getByLabel('Correo *').fill('marta@correo.com')
    await page.getByLabel('Puesto objetivo *').fill('Contadora de costos')
    await page.getByLabel('Habilidades (separadas por coma)').fill('Costos, Excel, SAP')
    await page.getByLabel(/Tengo consentimiento para guardar/).check()
    await page.getByRole('button', { name: 'Crear candidato', exact: true }).click()
    await page.getByText('Marta Gómez', { exact: true }).waitFor()
    afirmar(
      store.talento_candidatos.some((fila) => fila.nombre === 'Marta Gómez'),
      'candidato creado en la tabla',
    )
    await page.screenshot({ path: `${CAPTURAS}/02-candidatos.png`, fullPage: true })
    marcar('candidato creado')

    await page.getByRole('tab', { name: /^Empresas/ }).click()
    await page.getByText('Grupo del Norte SRL', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Nueva empresa', exact: true }).click()
    await page.getByRole('heading', { name: 'Nueva empresa empleadora', exact: true }).waitFor()
    await page.getByLabel('Nombre de la empresa *').fill('Farmacias del Este')
    await page.getByLabel('Contacto *', { exact: true }).fill('Rosa Díaz')
    await page.getByLabel('Correo del contacto *', { exact: true }).fill('rrhh@farmaciasdeleste.do')
    await page.getByLabel(/La empresa autoriza el uso de estos datos/).check()
    await page.getByRole('button', { name: 'Crear empresa', exact: true }).click()
    await page.getByText('Farmacias del Este', { exact: true }).waitFor()
    marcar('empresa empleadora creada')

    await page.getByRole('tab', { name: /^Vacantes/ }).click()
    await page.getByText('Analista contable senior', { exact: true }).waitFor()
    await page.getByRole('button', { name: /Analista contable senior/ }).first().click()
    await page.getByRole('heading', { name: 'Analista contable senior', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Buscar candidatos', exact: true }).click()
    await page.getByText('92% match', { exact: true }).waitFor()
    afirmar((await page.getByText('Carla Rojas', { exact: true }).count()) >= 1, 'sugerencia de IA visible')
    await page.getByRole('button', { name: 'Agregar al pipeline', exact: true }).click()
    await page.getByRole('button', { name: 'Agregado', exact: true }).waitFor()
    afirmar(
      store.talento_postulaciones.some(
        (fila) => fila.candidato_id === 'cand-3' && fila.vacante_id === 'vac-1' && fila.origen === 'ia',
      ),
      'proceso creado desde el matching',
    )
    await page.screenshot({ path: `${CAPTURAS}/03-vacante-ia.png`, fullPage: true })
    await page.getByRole('button', { name: 'Cerrar', exact: true }).last().click()
    marcar('matching con IA agregado al pipeline')

    await page.getByRole('tab', { name: /^Procesos/ }).click()
    await page.getByRole('button', { name: /Carla Rojas 92%/ }).waitFor()
    await page.getByRole('button', { name: /Carla Rojas 92%/ }).click()
    await page.getByRole('heading', { name: 'Carla Rojas', exact: true }).waitFor()
    await page.getByLabel('Etapa').selectOption('entrevista')
    await page.getByLabel('Fecha y hora de entrevista').fill('2026-10-25T10:00')
    await page.getByLabel('Entrevistador').fill('María Santos')
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
    await page.getByRole('heading', { name: 'Carla Rojas', exact: true }).waitFor({ state: 'detached' })
    afirmar(
      store.talento_postulaciones.some((fila) => fila.candidato_id === 'cand-3' && fila.etapa === 'entrevista'),
      'etapa de entrevista guardada',
    )

    await page.getByRole('button', { name: /Carla Rojas 92%/ }).click()
    await page.getByRole('heading', { name: 'Carla Rojas', exact: true }).waitFor()
    await page.getByLabel('Etapa').selectOption('contratada')
    await page.getByLabel('Fecha de inicio').fill('2026-11-02')
    await page.getByLabel('Salario final (RD$)').fill('90000')
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
    await page.getByRole('heading', { name: 'Carla Rojas', exact: true }).waitFor({ state: 'detached' })
    afirmar(
      store.talento_candidatos.some((fila) => fila.id === 'cand-3' && fila.estado === 'contratado'),
      'candidato marcado como contratado',
    )
    await page.screenshot({ path: `${CAPTURAS}/04-procesos.png`, fullPage: true })
    marcar('proceso movido y colocación cerrada')

    await page.goto(`${BASE}/talento`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'El talento correcto, sin vueltas.' }).waitFor()
    await page.getByRole('tab', { name: 'Busco talento' }).click()
    await page.getByText('Ana P.', { exact: true }).waitFor()
    afirmar((await page.getByText('ana@correo.com', { exact: true }).count()) === 0, 'el portal no muestra correos')
    afirmar((await page.getByText('809 555 0101', { exact: true }).count()) === 0, 'el portal no muestra teléfonos')
    await page.getByRole('button', { name: 'Añadir', exact: true }).first().click()
    await page.getByRole('button', { name: 'Solicitar entrevista', exact: true }).click()
    await page.getByRole('heading', { name: 'Solicitar entrevista', exact: true }).waitFor()
    await page.getByLabel('Empresa *', { exact: true }).fill('Farmacias del Este')
    await page.getByLabel('Contacto *', { exact: true }).fill('Rosa Díaz')
    await page.getByLabel('Correo *', { exact: true }).fill('rrhh@farmaciasdeleste.do')
    await page.getByLabel(/Autorizo a AviTech a usar estos datos/).check()
    await page.getByRole('button', { name: 'Enviar solicitud', exact: true }).click()
    await page.getByRole('heading', { name: 'Solicitud recibida', exact: true }).waitFor()
    const solicitud = peticionesPublicas.find((fila) => fila.tipo === 'solicitud')
    afirmar(Boolean(solicitud), 'solicitud de empresa enviada')
    afirmar(solicitud.cuerpo.candidato_ids.length === 1, 'shortlist enviada con un candidato')
    afirmar(solicitud.cuerpo.solicitud_tipo === 'entrevista', 'tipo de solicitud entrevista')
    await page.screenshot({ path: `${CAPTURAS}/05-portal-empresa.png`, fullPage: true })
    await page.getByRole('button', { name: 'Entendido', exact: true }).click()
    marcar('empresa pidió entrevista desde el portal')

    await page.getByRole('tab', { name: 'Busco empleo' }).click()
    await page.getByLabel('Nombre completo *').fill('Pedro Núñez')
    await page.getByLabel('Correo *').fill('pedro@correo.com')
    await page.getByLabel('Puesto que buscas *').fill('Analista de datos')
    await page.locator('input[type="file"]').setInputFiles({
      name: 'cv-prueba.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF'),
    })
    await page.getByLabel(/Autorizo a AviTech Solutions Group/).check()
    await page.getByRole('button', { name: 'Crear mi perfil', exact: true }).click()
    await page.getByText('Perfil creado', { exact: true }).waitFor()
    const postulacion = peticionesPublicas.find((fila) => fila.tipo === 'postulacion')
    afirmar(Boolean(postulacion), 'perfil público enviado')
    afirmar(postulacion.cuerpo.cv_path?.startsWith('publico/'), 'CV subido al bucket privado')
    afirmar(postulacion.cuerpo.cv_nombre === 'cv-prueba.pdf', 'nombre del CV conservado')
    afirmar(postulacion.cuerpo.consentimiento === true, 'consentimiento del candidato')
    await page.screenshot({ path: `${CAPTURAS}/06-portal-candidato.png`, fullPage: true })
    marcar('candidato creado con CV desde el portal')

    await page.getByRole('button', { name: 'Crear otro perfil', exact: true }).click()
    await page.getByLabel('Nombre completo *').fill('Lucía Santos')
    await page.getByLabel('Correo *').fill('lucia@correo.com')
    await page.getByLabel('Puesto que buscas *').fill('Analista contable senior')
    await page.getByRole('checkbox', { name: /Quiero que la IA busque y postule por mí/ }).check()
    await page.getByLabel(/Autorizo a AviTech Solutions Group/).check()
    await page.getByRole('button', { name: 'Crear perfil y postular con IA', exact: true }).click()
    await page.getByText('Postulación asistida completada', { exact: true }).waitFor()
    afirmar(
      (await page.getByText('Analista contable senior', { exact: true }).count()) >= 1,
      'vacante aplicada visible en el resultado',
    )
    const postulacionIA = peticionesPublicas.find((fila) => fila.tipo === 'ia')
    afirmar(Boolean(postulacionIA), 'postulación con IA enviada')
    afirmar(Boolean(postulacionIA.cuerpo.candidato_id), 'candidato identificado para la IA')
    afirmar(postulacionIA.cuerpo.token_publico === '00000000-0000-4000-8000-000000000011', 'token privado enviado')
    afirmar(
      store.talento_postulaciones.some((fila) => fila.origen === 'ia' && fila.match_score === 91),
      'postulación creada con origen y puntaje de IA',
    )
    await page.screenshot({ path: `${CAPTURAS}/08-portal-ia.png`, fullPage: true })
    marcar('IA buscó vacantes y postuló por el candidato')

    // Actualizar el perfil de Pedro desde este navegador: el token quedó guardado.
    await page.getByRole('button', { name: 'Crear otro perfil', exact: true }).click()
    await page.getByLabel('Nombre completo *').fill('Pedro Núñez')
    await page.getByLabel('Correo *').fill('pedro@correo.com')
    await page.getByLabel('Puesto que buscas *').fill('Analista de datos senior')
    await page.getByLabel(/Autorizo a AviTech Solutions Group/).check()
    await page.getByRole('button', { name: 'Crear mi perfil', exact: true }).click()
    await page.getByText('Perfil actualizado', { exact: true }).waitFor()
    const actualizacion = peticionesPublicas.filter((fila) => fila.tipo === 'postulacion').at(-1)
    afirmar(
      actualizacion.cuerpo.token_publico === '00000000-0000-4000-8000-000000000011',
      'el navegador envió el token guardado al actualizar',
    )
    marcar('perfil actualizado con el token del navegador')

    // Otro navegador no puede tocar el perfil de Ana: sin token, la base lo rechaza.
    await page.evaluate(() => {
      try {
        window.localStorage.removeItem('avitech:talento:perfil:ana@correo.com')
      } catch {
        // sin almacenamiento, igual se prueba el rechazo
      }
    })
    await page.getByRole('button', { name: 'Crear otro perfil', exact: true }).click()
    await page.getByLabel('Nombre completo *').fill('Ana Pérez')
    await page.getByLabel('Correo *').fill('ana@correo.com')
    await page.getByLabel('Puesto que buscas *').fill('Contadora senior')
    await page.getByLabel(/Autorizo a AviTech Solutions Group/).check()
    conflictosEsperados += 1
    await page.getByRole('button', { name: 'Crear mi perfil', exact: true }).click()
    await page.getByText('Ese correo ya tiene un perfil', { exact: true }).waitFor()
    afirmar(
      store.talento_candidatos.filter((fila) => fila.email === 'ana@correo.com').length === 1,
      'no se duplicó el perfil de Ana sin token',
    )
    await page.screenshot({ path: `${CAPTURAS}/09-perfil-protegido.png`, fullPage: true })
    marcar('perfil existente protegido sin token')

    // Mantenimiento: el panel detecta y borra CV que ya no tienen candidato.
    await page.goto(`${BASE}/#talento`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Talento', exact: true }).waitFor({ timeout: 20000 })
    await page.getByText('Solicitudes de empresas', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Buscar CV sin dueño', exact: true }).click()
    await page.getByText('1 CV sin candidato', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Borrar 1', exact: true }).click()
    await page.getByText('Se borraron 1 CV que ya no pertenecían a ningún perfil.', { exact: true }).waitFor()
    await page.screenshot({ path: `${CAPTURAS}/10-mantenimiento-cv.png`, fullPage: true })
    marcar('CV huérfano detectado y borrado desde el panel')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${BASE}/talento`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'El talento correcto, sin vueltas.' }).waitFor()
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    afirmar(desborde <= 1, `el portal no desborda en móvil (${desborde}px)`)
    await page.screenshot({ path: `${CAPTURAS}/07-movil.png`, fullPage: true })
    marcar('portal revisado en móvil')

    afirmar(errores.length === 0, `errores de consola: ${errores.join(' | ')}`)
    return {
      ok: true,
      pasos,
      errores,
      resumen: {
        candidatos: store.talento_candidatos.length,
        empresas: store.talento_empresas.length,
        vacantes: store.talento_vacantes.length,
        procesos: store.talento_postulaciones.length,
        peticiones_publicas: peticionesPublicas.map((fila) => fila.tipo),
      },
    }
  }

  try {
    return await ejecutar()
  } catch (fallo) {
    return {
      ok: false,
      pasos,
      errores,
      fallo: fallo instanceof Error ? fallo.message : String(fallo),
    }
  }
}
