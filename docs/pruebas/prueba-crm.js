async (page) => {
  const BASE = 'http://localhost:5181'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-crm'
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

  let contador = 100
  const nuevoId = (prefijo) => `${prefijo}-${++contador}`

  const store = {
    crm_empresas: [
      { id: 'e1', nombre: 'Ferretería Pérez SRL', dominio: 'ferreteriaperez.do', industria: 'Ferretería', telefono: '809-555-0101', sitio_web: 'https://ferreteriaperez.do', notas: null, cliente_id: null, created_at: ahoraISO() },
      { id: 'e2', nombre: 'Clínica Delta', dominio: 'clinicadelta.do', industria: 'Salud', telefono: '809-555-0202', sitio_web: null, notas: null, cliente_id: null, created_at: ahoraISO() },
      { id: 'e3', nombre: 'Grupo Legal Caribe', dominio: 'grupolegalcaribe.do', industria: 'Legal', telefono: '809-555-0303', sitio_web: null, notas: null, cliente_id: 'cliente-existente', created_at: ahoraISO() },
    ],
    crm_contactos: [
      { id: 'c1', empresa_id: 'e1', nombre: 'Ana Pérez', cargo: 'Gerente', email: 'ana@ferreteriaperez.do', telefono: '809-555-0102', linkedin: null, notas: null, created_at: ahoraISO() },
      { id: 'c2', empresa_id: 'e2', nombre: 'Dr. Luis Medina', cargo: 'Director médico', email: 'luis@clinicadelta.do', telefono: '809-555-0203', linkedin: null, notas: null, created_at: ahoraISO() },
      { id: 'c3', empresa_id: 'e3', nombre: 'Carla Jiménez', cargo: 'Socia', email: 'carla@grupolegalcaribe.do', telefono: null, linkedin: null, notas: null, created_at: ahoraISO() },
    ],
    crm_oportunidades: [
      { id: 'o1', empresa_id: 'e1', contacto_id: 'c1', titulo: 'Iguala contable 2027', etapa: 'propuesta', monto: 36000, probabilidad: 60, fecha_cierre: '2026-11-15', notas: null, created_at: ahoraISO(), updated_at: ahoraISO() },
      { id: 'o2', empresa_id: 'e2', contacto_id: 'c2', titulo: 'Auditoría de procesos', etapa: 'reunion', monto: 85000, probabilidad: 35, fecha_cierre: '2026-12-01', notas: null, created_at: ahoraISO(), updated_at: ahoraISO() },
      { id: 'o3', empresa_id: 'e3', contacto_id: 'c3', titulo: 'Asesoría legal recurrente', etapa: 'ganado', monto: 24000, probabilidad: 100, fecha_cierre: '2026-10-10', notas: null, created_at: ahoraISO(), updated_at: ahoraISO() },
      { id: 'o4', empresa_id: 'e1', contacto_id: null, titulo: 'Implementación de software', etapa: 'contactado', monto: 50000, probabilidad: 20, fecha_cierre: null, notas: null, created_at: ahoraISO(), updated_at: ahoraISO() },
      { id: 'o5', empresa_id: 'e2', contacto_id: 'c2', titulo: 'Capacitación NIIF', etapa: 'perdido', monto: 15000, probabilidad: 0, fecha_cierre: null, notas: null, created_at: ahoraISO(), updated_at: ahoraISO() },
    ],
    crm_actividades: [
      { id: 'a1', oportunidad_id: 'o1', contacto_id: 'c1', tipo: 'llamada', titulo: 'Llamar para confirmar propuesta', detalle: null, fecha: '2026-10-22', completada: false, created_at: ahoraISO() },
      { id: 'a2', oportunidad_id: 'o2', contacto_id: 'c2', tipo: 'correo', titulo: 'Enviar cuestionario de auditoría', detalle: null, fecha: '2026-10-15', completada: false, created_at: ahoraISO() },
      { id: 'a3', oportunidad_id: 'o3', contacto_id: 'c3', tipo: 'reunion', titulo: 'Reunión de inicio', detalle: null, fecha: '2026-10-12', completada: true, created_at: ahoraISO() },
      { id: 'a4', oportunidad_id: null, contacto_id: null, tipo: 'tarea', titulo: 'Actualizar plantilla de propuestas', detalle: null, fecha: '2026-10-25', completada: false, created_at: ahoraISO() },
    ],
    clientes: [],
  }

  const embedEmpresa = (id) => {
    const empresa = store.crm_empresas.find((fila) => fila.id === id)
    return empresa ? { id: empresa.id, nombre: empresa.nombre, cliente_id: empresa.cliente_id } : null
  }
  const embedContacto = (id) => {
    const contacto = store.crm_contactos.find((fila) => fila.id === id)
    return contacto ? { nombre: contacto.nombre } : null
  }
  const enriquecer = (tabla, fila) => {
    if (tabla === 'crm_oportunidades') {
      return { ...fila, crm_empresas: embedEmpresa(fila.empresa_id), crm_contactos: embedContacto(fila.contacto_id) }
    }
    if (tabla === 'crm_contactos') {
      const empresa = store.crm_empresas.find((otra) => otra.id === fila.empresa_id)
      return { ...fila, crm_empresas: empresa ? { nombre: empresa.nombre } : null }
    }
    if (tabla === 'crm_actividades') {
      const oportunidad = store.crm_oportunidades.find((otra) => otra.id === fila.oportunidad_id)
      const empresa = oportunidad ? store.crm_empresas.find((otra) => otra.id === oportunidad.empresa_id) : null
      return {
        ...fila,
        crm_oportunidades: oportunidad
          ? { titulo: oportunidad.titulo, crm_empresas: empresa ? { nombre: empresa.nombre } : null }
          : null,
        crm_contactos: embedContacto(fila.contacto_id),
      }
    }
    return { ...fila }
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
      return ruta.fulfill({
        status: 200,
        headers: cabecerasJson,
        body: JSON.stringify(datos.map((fila) => enriquecer(tabla, fila))),
      })
    }
    if (peticion.method() === 'POST') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const fila = { id: nuevoId(tabla), created_at: ahoraISO(), ...cuerpo }
      if (tabla === 'crm_oportunidades') fila.updated_at = ahoraISO()
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
        Object.assign(fila, cuerpo)
        if (tabla === 'crm_oportunidades') fila.updated_at = ahoraISO()
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
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('about:blank')

  const ejecutar = async () => {
    // Los scripts viejos del propio navegador fallan en about:blank (localStorage bloqueado).
    errores.length = 0
    await page.goto(`${BASE}/#crm`, { waitUntil: 'networkidle' })
    marcar('pipeline cargado')

    // ---------- Pipeline ----------
    await page.getByRole('heading', { name: 'CRM', exact: true }).waitFor({ timeout: 20000 })
    await page.getByRole('button', { name: 'Editar Iguala contable 2027' }).waitFor()
    afirmar((await page.getByText('RD$171,000.00', { exact: true }).count()) >= 1, 'pipeline abierto RD$171,000.00')
    afirmar((await page.getByText('RD$61,350.00', { exact: true }).count()) >= 1, 'ponderado RD$61,350.00')
    afirmar((await page.getByText('RD$24,000.00', { exact: true }).count()) >= 1, 'ganado RD$24,000.00')
    afirmar((await page.getByText('1 atrasada', { exact: true }).count()) >= 1, 'aviso de actividad atrasada')
    await page.screenshot({ path: `${CAPTURAS}/01-pipeline.png`, fullPage: true })

    // ---------- Empresas ----------
    await page.getByRole('tab', { name: /^Empresas/ }).click()
    await page.getByText('Ferretería Pérez SRL').waitFor()
    afirmar((await page.getByText('Cliente', { exact: true }).count()) >= 1, 'insignia Cliente en Grupo Legal Caribe')
    await page.screenshot({ path: `${CAPTURAS}/02-empresas.png`, fullPage: true })

    // ---------- Contactos ----------
    await page.getByRole('tab', { name: /^Contactos/ }).click()
    await page.getByText('Ana Pérez').waitFor()
    await page.getByText('Dr. Luis Medina').waitFor()
    await page.screenshot({ path: `${CAPTURAS}/03-contactos.png`, fullPage: true })

    // ---------- Actividades ----------
    await page.getByRole('tab', { name: /^Actividades/ }).click()
    await page.getByText('Llamar para confirmar propuesta').waitFor()
    afirmar((await page.getByText('Atrasada', { exact: true }).count()) >= 1, 'insignia Atrasada')
    await page.screenshot({ path: `${CAPTURAS}/04-actividades.png`, fullPage: true })

    // ---------- Crear oportunidad ----------
    await page.getByRole('tab', { name: /^Pipeline/ }).click()
    await page.getByRole('button', { name: 'Editar Iguala contable 2027' }).waitFor()
    await page.getByRole('button', { name: 'Nueva oportunidad' }).click()
    await page.getByRole('heading', { name: 'Nueva oportunidad' }).waitFor()
    await page.waitForTimeout(150)
    const foco = await page.evaluate(() => document.activeElement?.getAttribute('placeholder'))
    afirmar(foco === 'Ej. Iguala contable 2027', `auto-foco en Título (fue: ${foco})`)
    await page.screenshot({ path: `${CAPTURAS}/05-modal-oportunidad.png`, fullPage: true })
    marcar('modal oportunidad abierto')
    await page.getByLabel(/^Título/).fill('Iguala de software 2027')
    await page.getByLabel(/^Empresa/).selectOption({ label: 'Clínica Delta' })
    marcar('empresa seleccionada')
    await page.getByLabel(/^Contacto/).selectOption({ label: 'Dr. Luis Medina' })
    marcar('contacto seleccionado')
    await page.getByLabel(/^Etapa/).selectOption({ label: 'Propuesta' })
    await page.getByLabel(/^Monto/).fill('48000')
    await page.getByLabel(/^Probabilidad/).fill('50')
    await page.getByLabel(/^Fecha de cierre/).fill('2026-11-30')
    await page.getByRole('button', { name: 'Crear oportunidad' }).click()
    await page.getByRole('heading', { name: 'Nueva oportunidad' }).waitFor({ state: 'detached' })
    await page.getByRole('button', { name: 'Editar Iguala de software 2027' }).waitFor()
    afirmar((await page.getByText('RD$219,000.00', { exact: true }).count()) >= 1, 'pipeline abierto actualizado a RD$219,000.00')
    afirmar((await page.getByText('RD$85,350.00', { exact: true }).count()) >= 1, 'ponderado actualizado a RD$85,350.00')
    const columnaPropuesta = page.locator('div.w-64').filter({
      has: page.getByRole('button', { name: 'Editar Iguala de software 2027' }),
    })
    afirmar((await columnaPropuesta.innerText()).includes('Propuesta'), 'la oportunidad nueva está en Propuesta')
    marcar('oportunidad creada')

    // ---------- Cambiar de etapa desde el modal ----------
    await page.getByRole('button', { name: 'Editar Iguala de software 2027' }).click()
    await page.getByRole('heading', { name: 'Editar oportunidad' }).waitFor()
    await page.getByLabel(/^Etapa/).selectOption({ label: 'Negociación' })
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await page.getByRole('heading', { name: 'Editar oportunidad' }).waitFor({ state: 'detached' })
    const columnaNegociacion = page.locator('div.w-64').filter({
      has: page.getByRole('button', { name: 'Editar Iguala de software 2027' }),
    })
    afirmar((await columnaNegociacion.innerText()).includes('Negociación'), 'la oportunidad se movió a Negociación')
    marcar('etapa cambiada')

    // ---------- Empresas: crear y convertir ----------
    await page.getByRole('tab', { name: /^Empresas/ }).click()
    await page.getByText('Ferretería Pérez SRL').waitFor()
    await page.getByRole('button', { name: 'Nueva empresa' }).click()
    await page.getByRole('heading', { name: 'Nueva empresa' }).waitFor()
    await page.getByLabel(/^Nombre/).fill('Constructora Horizonte')
    await page.getByLabel(/^Dominio/).fill('horizonte.do')
    await page.getByLabel(/^Industria/).fill('Construcción')
    await page.getByRole('button', { name: 'Crear empresa' }).click()
    await page.getByText('Constructora Horizonte').waitFor()
    afirmar((await page.locator('li').count()) === 4, '4 empresas tras crear Constructora Horizonte')
    marcar('empresa creada')

    const filaFerreteria = page.locator('li').filter({ hasText: 'Ferretería Pérez SRL' })
    await filaFerreteria.getByRole('button', { name: 'Convertir en cliente' }).click()
    await page.getByRole('heading', { name: 'Convertir en cliente' }).waitFor()
    const textoConversion = await page.getByRole('dialog').innerText()
    afirmar(textoConversion.includes('Ana Pérez'), 'la conversión propone a Ana Pérez como contacto')
    await page.getByRole('button', { name: 'Convertir', exact: true }).click()
    await filaFerreteria.getByText('Cliente', { exact: true }).waitFor()
    afirmar(store.clientes.length === 1, 'se creó 1 cliente desde el CRM')
    afirmar(store.clientes[0]?.nombre === 'Ana Pérez', 'el cliente usa el nombre del contacto')
    afirmar(store.clientes[0]?.empresa === 'Ferretería Pérez SRL', 'el cliente guarda la empresa')
    afirmar(Boolean(store.crm_empresas.find((fila) => fila.id === 'e1')?.cliente_id), 'la empresa quedó vinculada al cliente')
    await page.getByPlaceholder(/Buscar por nombre, industria/).fill('Clínica')
    afirmar((await page.locator('li').count()) === 1, 'búsqueda de empresas filtra a 1')
    await page.getByPlaceholder(/Buscar por nombre, industria/).fill('')
    afirmar((await page.locator('li').count()) === 4, 'búsqueda de empresas se limpia')
    marcar('empresa convertida')

    // ---------- Contactos: crear y buscar ----------
    await page.getByRole('tab', { name: /^Contactos/ }).click()
    await page.getByText('Ana Pérez').waitFor()
    await page.getByRole('button', { name: 'Nuevo contacto' }).click()
    await page.getByRole('heading', { name: 'Nuevo contacto' }).waitFor()
    await page.getByLabel(/^Empresa/).selectOption({ label: 'Constructora Horizonte' })
    await page.getByLabel(/^Nombre/).fill('Pedro Ramírez')
    await page.getByLabel(/^Cargo/).fill('Gerente de proyectos')
    await page.getByLabel(/^Correo/).fill('pedro@horizonte.do')
    await page.getByRole('button', { name: 'Crear contacto' }).click()
    await page.getByText('Pedro Ramírez').waitFor()
    afirmar((await page.locator('li').count()) === 4, '4 contactos tras crear a Pedro Ramírez')
    await page.getByPlaceholder(/Buscar por nombre, cargo/).fill('Pedro')
    afirmar((await page.locator('li').count()) === 1, 'búsqueda de contactos filtra a 1')
    await page.getByPlaceholder(/Buscar por nombre, cargo/).fill('')
    marcar('contacto creado')

    // ---------- Actividades: completar, filtrar y crear ----------
    await page.getByRole('tab', { name: /^Actividades/ }).click()
    await page.getByText('Llamar para confirmar propuesta').waitFor()
    const filaActividad = page.locator('li').filter({ hasText: 'Llamar para confirmar propuesta' })
    await filaActividad.getByRole('button', { name: 'Marcar como completada' }).click()
    await filaActividad.waitFor({ state: 'detached' })
    await page.getByRole('combobox').first().selectOption('completadas')
    await page.getByText('Llamar para confirmar propuesta').waitFor()
    await page.getByRole('combobox').first().selectOption('pendientes')
    await page.getByText('Enviar cuestionario de auditoría').waitFor()
    marcar('actividad completada')
    await page.getByRole('button', { name: 'Nueva actividad' }).click()
    await page.getByRole('heading', { name: 'Nueva actividad' }).waitFor()
    await page.getByLabel(/^Título/).fill('Enviar propuesta de software')
    await page.getByLabel(/^Tipo/).selectOption({ label: 'Correo' })
    await page.getByLabel(/^Fecha/).fill('2026-10-23')
    await page.getByLabel(/^Oportunidad/).selectOption({ label: 'Iguala de software 2027 — Clínica Delta' })
    marcar('oportunidad de actividad seleccionada')
    await page.getByLabel(/^Contacto/).selectOption({ label: 'Dr. Luis Medina — Clínica Delta' })
    marcar('contacto de actividad seleccionado')
    await page.getByRole('button', { name: 'Crear actividad' }).click()
    await page.getByRole('heading', { name: 'Nueva actividad' }).waitFor({ state: 'detached' })
    await page.getByText('Enviar propuesta de software').waitFor()
    await page.getByPlaceholder(/Buscar por título, empresa/).fill('software')
    afirmar((await page.locator('li').count()) === 1, 'búsqueda de actividades filtra a 1')
    await page.getByPlaceholder(/Buscar por título, empresa/).fill('')
    marcar('actividad creada')

    // ---------- Búsqueda sin resultados en Pipeline ----------
    await page.getByRole('tab', { name: /^Pipeline/ }).click()
    await page.getByRole('button', { name: 'Editar Iguala contable 2027' }).waitFor()
    await page.getByPlaceholder(/Buscar por oportunidad/).fill('zzz')
    await page.getByText('Sin resultados', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()
    await page.getByRole('button', { name: 'Editar Iguala contable 2027' }).waitFor()
    marcar('búsqueda probada')

    afirmar(errores.length === 0, `sin errores de consola (encontrados: ${errores.join(' | ')})`)

    return {
      ok: true,
      pasos,
      erroresConsola: errores,
      oportunidades: store.crm_oportunidades.length,
      empresas: store.crm_empresas.length,
      contactos: store.crm_contactos.length,
      actividades: store.crm_actividades.length,
      clientesCreados: store.clientes.length,
      clienteCreado: store.clientes[0] ?? null,
      etapaSoftware: store.crm_oportunidades.find((fila) => fila.titulo === 'Iguala de software 2027')?.etapa ?? null,
      capturas: ['01-pipeline.png', '02-empresas.png', '03-contactos.png', '04-actividades.png', '05-modal-oportunidad.png'],
    }
  }

  try {
    return await ejecutar()
  } catch (error) {
    const selects = await page
      .locator('select')
      .evaluateAll((nodos) =>
        nodos.map((nodo) => ({
          etiqueta: nodo.closest('label')?.querySelector('span')?.textContent ?? '(sin etiqueta)',
          valor: nodo.value,
          opciones: Array.from(nodo.options).map((o) => o.textContent),
        })),
      )
      .catch(() => [])
    const texto = await page
      .evaluate(() => document.body.innerText.slice(-900))
      .catch(() => '')
    return { ok: false, fallo: String(error), pasos, errores, selects, texto }
  }
}
