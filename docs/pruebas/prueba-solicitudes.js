async (page) => {
  const BASE = 'http://localhost:5182'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-solicitudes'
  const CLAVE = 'sb-ktvyhtbmokmrzeuibznv-auth-token'

  const ahora = Math.floor(Date.now() / 1000)
  const ahoraISO = () => new Date().toISOString()
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

  const planDemo = {
    resumen: 'La empresa necesita ordenar su presencia digital y convertir más visitas en clientes.',
    alcance: 'Auditoría SEO del sitio, revisión de contenido y plan de acción para 90 días.',
    entregables: ['Auditoría técnica con prioridades', 'Plan de contenidos de 90 días', 'Informe ejecutivo'],
    tareas: ['Revisar rastreo e indexación', 'Analizar títulos y metadescripciones', 'Priorizar correcciones'],
    cronograma: ['Semana 1: diagnóstico', 'Semana 2: plan de acción', 'Semana 3: entrega'],
    precio_sugerido: 48000,
    propuesta: 'Propuesta de auditoría SEO y plan de contenidos para Grupo del Norte.',
    correo: 'Asunto: Propuesta de auditoría SEO\n\nHola Ana, adjuntamos la propuesta preparada para tu empresa.',
    informe:
      'RESUMEN EJECUTIVO\nEl sitio tiene una base sólida, pero pierde oportunidades por títulos y metadescripciones débiles.\n\nHALLAZGOS\n- Falta una estructura clara de encabezados.\n- Hay imágenes sin texto alternativo.\n\nPLAN DE ACCIÓN\n1. Corregir metadatos.\n2. Publicar dos contenidos al mes.\n3. Medir resultados cada 30 días.\n\nSUPUESTOS\nNo se recibieron accesos a Google Search Console.',
    nivel_confianza: 'medio',
    datos_pendientes: ['Acceso a Google Search Console', 'Objetivos comerciales del trimestre'],
  }

  const store = {
    solicitudes_servicio: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        origen: 'publico',
        canal: 'formulario',
        cliente_id: null,
        solicitante_nombre: 'Ana Pérez',
        empresa: 'Grupo del Norte',
        email: 'ana@gruponorte.do',
        telefono: '809 555 0101',
        sitio_web: 'https://gruponorte.do',
        tipo: 'seo',
        titulo: 'Auditoría SEO y plan de contenidos',
        descripcion: 'Necesitamos revisar el sitio web y preparar un plan de contenidos para los próximos tres meses.',
        objetivos: 'Aumentar las consultas comerciales.',
        presupuesto: 40000,
        urgencia: 'alta',
        fecha_deseada: '2026-11-15',
        estado: 'nueva',
        plan_ia: null,
        informe_ia: null,
        propuesta_ia: null,
        correo_ia: null,
        precio_sugerido: null,
        servicio_id: null,
        oportunidad_id: null,
        empresa_id: null,
        contacto_id: null,
        cliente_creado: false,
        error_ia: null,
        ejecutado_en: null,
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        origen: 'interno',
        canal: 'whatsapp',
        cliente_id: 'cliente-1',
        solicitante_nombre: 'Luis Medina',
        empresa: 'Clínica Delta',
        email: 'luis@clinicadelta.do',
        telefono: '809 555 0202',
        sitio_web: null,
        tipo: 'consultoria',
        titulo: 'Rediseño del proceso de facturación',
        descripcion: 'Quieren ordenar la facturación y reducir errores antes del cierre de año.',
        objetivos: null,
        presupuesto: 30000,
        urgencia: 'media',
        fecha_deseada: null,
        estado: 'completada',
        plan_ia: planDemo,
        informe_ia: planDemo.informe,
        propuesta_ia: planDemo.propuesta,
        correo_ia: planDemo.correo,
        precio_sugerido: 48000,
        servicio_id: 'servicio-1',
        oportunidad_id: 'oportunidad-1',
        empresa_id: 'empresa-1',
        contacto_id: 'contacto-1',
        cliente_creado: false,
        error_ia: null,
        ejecutado_en: ahoraISO(),
        created_at: ahoraISO(),
        updated_at: ahoraISO(),
      },
    ],
    clientes: [{ id: 'cliente-1', nombre: 'Clínica Delta', empresa: 'Clínica Delta' }],
    servicios: [],
    pagos: [],
    gastos: [],
    igualas: [],
  }

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
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(datos) })
    }
    if (peticion.method() === 'POST') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const fila = { id: `nueva-${Date.now()}`, created_at: ahoraISO(), updated_at: ahoraISO(), ...cuerpo }
      datos.push(fila)
      const aceptaObjeto = (peticion.headers()['accept'] || '').includes('vnd.pgrst.object')
      return ruta.fulfill({
        status: 201,
        headers: cabecerasJson,
        body: JSON.stringify(aceptaObjeto ? fila : [fila]),
      })
    }
    if (peticion.method() === 'PATCH') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const id = (url.searchParams.get('id') || '').replace('eq.', '')
      const fila = datos.find((otra) => otra.id === id)
      if (fila) Object.assign(fila, cuerpo, { updated_at: ahoraISO() })
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(fila ? [fila] : []) })
    }
    return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '[]' })
  })

  await page.route('**/api/solicitudes/ejecutar', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    const { id } = JSON.parse(peticion.postData() || '{}')
    const solicitud = store.solicitudes_servicio.find((fila) => fila.id === id)
    if (!solicitud) {
      return ruta.fulfill({ status: 404, headers: cabecerasJson, body: JSON.stringify({ error: 'No existe' }) })
    }
    Object.assign(solicitud, {
      estado: 'completada',
      plan_ia: planDemo,
      informe_ia: planDemo.informe,
      propuesta_ia: planDemo.propuesta,
      correo_ia: planDemo.correo,
      precio_sugerido: planDemo.precio_sugerido,
      servicio_id: 'servicio-nuevo',
      oportunidad_id: 'oportunidad-nueva',
      empresa_id: 'empresa-1',
      contacto_id: 'contacto-1',
      cliente_creado: true,
      ejecutado_en: ahoraISO(),
    })
    return ruta.fulfill({
      status: 200,
      headers: cabecerasJson,
      body: JSON.stringify({
        ok: true,
        servicio_id: 'servicio-nuevo',
        mensaje: 'Servicio creado y completado por la IA.',
      }),
    })
  })

  const errores = []
  page.on('console', (mensaje) => {
    if (mensaje.type() === 'error') errores.push(`console: ${mensaje.text()}`)
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
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('about:blank')

  const ejecutar = async () => {
    errores.length = 0
    await page.goto(`${BASE}/#solicitudes`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Solicitudes', exact: true }).waitFor({ timeout: 20000 })
    marcar('bandeja cargada')

    afirmar((await page.getByText('Auditoría SEO y plan de contenidos').count()) >= 1, 'solicitud pública visible')
    afirmar((await page.getByText('Formulario público', { exact: true }).count()) >= 1, 'insignia origen público')
    afirmar((await page.getByText('Completada', { exact: true }).count()) >= 1, 'solicitud completada visible')
    await page.screenshot({ path: `${CAPTURAS}/01-bandeja.png`, fullPage: true })
    marcar('bandeja verificada')

    await page.getByRole('button', { name: 'Nueva solicitud' }).first().click()
    await page.getByRole('heading', { name: 'Nueva solicitud de servicio' }).waitFor()
    await page.getByLabel(/^Nombre del solicitante/).fill('Pedro Ramírez')
    await page.getByLabel(/^Empresa/).fill('Constructora Horizonte')
    await page.getByLabel(/^Correo/).fill('pedro@horizonte.do')
    await page.getByLabel(/^Título de la solicitud/).fill('Diagnóstico de procesos contables')
    await page.getByLabel(/^¿Qué necesita/).fill(
      'Necesitamos revisar el cierre contable mensual, ordenar los soportes y reducir el tiempo de entrega.',
    )
    await page.getByRole('checkbox').uncheck()
    await page.getByRole('button', { name: 'Guardar solicitud' }).click()
    await page.getByRole('heading', { name: 'Nueva solicitud de servicio' }).waitFor({ state: 'detached' })
    await page.getByText('Diagnóstico de procesos contables').waitFor()
    marcar('solicitud interna creada')

    const fila = page.locator('li').filter({ hasText: 'Diagnóstico de procesos contables' })
    await fila.getByRole('button', { name: 'Ejecutar IA' }).click()
    await fila.getByText('Completada', { exact: true }).waitFor({ timeout: 15000 })
    await fila.getByRole('button', { name: 'Ver detalle' }).click()
    await page.getByText('Plan preparado por la IA').waitFor()
    afirmar((await page.getByText('Informe de entrega').count()) >= 1, 'informe visible en el detalle')
    afirmar((await page.getByText('RD$48,000.00').count()) >= 1, 'precio sugerido visible')
    await page.screenshot({ path: `${CAPTURAS}/02-detalle.png`, fullPage: true })
    marcar('ejecución y detalle verificados')

    await page.getByRole('button', { name: 'Cerrar' }).last().click()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: `${CAPTURAS}/03-movil.png`, fullPage: true })
    marcar('vista móvil capturada')

    afirmar(errores.length === 0, `sin errores de consola (encontrados: ${errores.join(' | ')})`)

    return {
      ok: true,
      pasos,
      erroresConsola: errores,
      solicitudes: store.solicitudes_servicio.length,
      completadas: store.solicitudes_servicio.filter((fila) => fila.estado === 'completada').length,
      capturas: ['01-bandeja.png', '02-detalle.png', '03-movil.png'],
    }
  }

  try {
    return await ejecutar()
  } catch (error) {
    const texto = await page.evaluate(() => document.body.innerText.slice(-1200)).catch(() => '')
    return { ok: false, fallo: String(error), pasos, errores, texto }
  }
}
