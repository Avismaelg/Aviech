// Prueba de humo de Prospección (scraper de contactos → CRM) con mocks.
// Uso: npm run build; npm run preview -- --port 5181 --strictPort;
//      luego ejecutar este archivo con la herramienta de Playwright (browser_run_code_unsafe + filename).
async (page) => {
  const BASE = 'http://localhost:5181'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-prospeccion'
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

  let contador = 0
  const nuevoId = () => `fila-${++contador}`
  let llamadasScraper = 0

  const store = { crm_empresas: [], crm_contactos: [] }

  const datosScrape = (nombre, dominio, extra = {}) => ({
    url: `https://${dominio}/`,
    urlFinal: `https://${dominio}/`,
    dominio,
    nombre,
    paginas: [
      { url: `https://${dominio}/`, estado: 200, titulo: `${nombre} · Inicio` },
      { url: `https://${dominio}/contacto`, estado: 200, titulo: 'Contáctanos' },
      { url: `https://${dominio}/nosotros`, estado: 404, titulo: '' },
    ],
    emails: extra.emails ?? [
      { valor: `info@${dominio}`, origen: 'inicio' },
      { valor: `ventas@${dominio}`, origen: 'contacto' },
    ],
    telefonos: extra.telefonos ?? [{ valor: '(809) 555-1234', origen: 'inicio' }],
    redes: extra.redes ?? [
      { red: 'LinkedIn', url: `https://www.linkedin.com/company/${dominio.split('.')[0]}`, origen: 'inicio' },
      { red: 'Instagram', url: `https://www.instagram.com/${dominio.split('.')[0]}`, origen: 'inicio' },
      { red: 'WhatsApp', url: 'https://wa.me/18095551234', origen: 'contacto' },
    ],
    tiempoMs: 2150,
    fecha: ahoraISO(),
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

  // API de Prospección (Worker): respuesta simulada por dominio.
  await page.route('**/api/scraper/contactos**', async (ruta) => {
    llamadasScraper++
    const destino = new URL(ruta.request().url()).searchParams.get('url') || ''
    let dominio = ''
    try {
      dominio = new URL(destino).hostname.replace(/^www\./, '')
    } catch {
      dominio = ''
    }
    const catalogo = {
      'empresa-nueva.com': datosScrape('Distribuidora del Caribe SRL', 'empresa-nueva.com'),
      'conocida.com': datosScrape('Panadería La Espiga', 'conocida.com'),
    }
    const datos = catalogo[dominio]
    if (!datos) {
      return ruta.fulfill({
        status: 502,
        headers: cabecerasJson,
        body: JSON.stringify({ error: 'No se pudo abrir el sitio. Revisa la dirección o inténtalo de nuevo.' }),
      })
    }
    return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(datos) })
  })

  await page.route('**/rest/v1/**', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    const url = new URL(peticion.url())
    const tabla = url.pathname.split('/rest/v1/')[1].split('/')[0]
    const datos = store[tabla]
    if (!datos) return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '[]' })

    if (peticion.method() === 'GET') {
      let filas = [...datos].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      const dominio = url.searchParams.get('dominio')
      if (dominio && dominio.startsWith('ilike.')) {
        const patron = dominio.slice('ilike.'.length).toLowerCase()
        filas = filas.filter((fila) => String(fila.dominio || '').toLowerCase() === patron)
      }
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(filas) })
    }
    if (peticion.method() === 'POST') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const fila = { id: nuevoId(), created_at: ahoraISO(), ...cuerpo }
      datos.push(fila)
      const aceptaObjeto = (peticion.headers()['accept'] || '').includes('vnd.pgrst.object')
      return ruta.fulfill({
        status: 201,
        headers: cabecerasJson,
        body: JSON.stringify(aceptaObjeto ? fila : [fila]),
      })
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
    errores.length = 0
    await page.goto(`${BASE}/#prospeccion`, { waitUntil: 'networkidle' })
    marcar('prospección abierta por enlace profundo')

    // ---------- Estado inicial ----------
    await page.getByRole('heading', { name: 'Prospección' }).waitFor({ timeout: 20000 })
    await page.getByText('Encuentra clientes potenciales').waitFor()
    await page.getByLabel('Dirección de la web a prospectar').waitFor()
    await page.screenshot({ path: `${CAPTURAS}/01-inicio.png`, fullPage: true })
    marcar('estado vacío visible')

    // ---------- Búsqueda de contactos ----------
    await page.getByLabel('Dirección de la web a prospectar').fill('empresa-nueva.com')
    await page.getByRole('button', { name: 'Buscar contactos' }).click()
    await page.getByRole('heading', { name: 'Distribuidora del Caribe SRL' }).waitFor({ timeout: 20000 })
    afirmar(llamadasScraper === 1, `se llamó 1 vez a la API (fue ${llamadasScraper})`)
    await page.getByText('info@empresa-nueva.com').waitFor()
    await page.getByText('(809) 555-1234').waitFor()
    await page.getByText('WhatsApp').waitFor()
    await page.getByText('6 hallazgos').waitFor()
    await page.getByRole('heading', { name: 'Páginas revisadas' }).waitFor()
    await page.getByText('HTTP 404').waitFor()
    await page.screenshot({ path: `${CAPTURAS}/02-resultado.png`, fullPage: true })
    marcar('búsqueda con correos, teléfonos y redes')

    // ---------- Guardar en el CRM (empresa nueva) ----------
    await page.getByRole('button', { name: 'Guardar en el CRM' }).click()
    await page.getByRole('button', { name: 'Crear empresa y contacto' }).waitFor({ timeout: 10000 })
    afirmar((await page.getByRole('textbox', { name: 'Empresa *' }).inputValue()) === 'Distribuidora del Caribe SRL', 'el nombre de empresa llegó precargado')
    afirmar((await page.getByRole('combobox', { name: /^Correo/ }).inputValue()) === 'info@empresa-nueva.com', 'el correo principal llegó precargado')
    await page.screenshot({ path: `${CAPTURAS}/03-modal.png`, fullPage: true })
    await page.getByRole('button', { name: 'Crear empresa y contacto' }).click()
    await page.getByText('y su contacto ya están en el CRM').waitFor({ timeout: 10000 })
    afirmar(store.crm_empresas.length === 1, `se creó 1 empresa (fueron ${store.crm_empresas.length})`)
    afirmar(store.crm_contactos.length === 1, `se creó 1 contacto (fueron ${store.crm_contactos.length})`)
    afirmar(store.crm_empresas[0].dominio === 'empresa-nueva.com', 'la empresa guarda el dominio sin www')
    afirmar(store.crm_contactos[0].empresa_id === store.crm_empresas[0].id, 'el contacto quedó ligado a la empresa')
    afirmar(store.crm_contactos[0].email === 'info@empresa-nueva.com', 'el contacto guarda el correo')
    afirmar(String(store.crm_contactos[0].notas || '').includes('Prospección'), 'las notas mencionan la Prospección')
    await page.screenshot({ path: `${CAPTURAS}/04-guardado.png`, fullPage: true })
    marcar('empresa y contacto creados en el CRM')

    // ---------- Ver en el CRM ----------
    await page.getByRole('button', { name: 'Ver en el CRM' }).click()
    await page.getByRole('heading', { name: 'CRM' }).waitFor({ timeout: 20000 })
    afirmar(page.url().includes('#crm'), 'la URL cambió a #crm')
    marcar('salto al CRM')

    // ---------- Empresa ya existente ----------
    store.crm_empresas.push({
      id: 'empresa-conocida',
      nombre: 'Cliente Conocido SRL',
      dominio: 'conocida.com',
      industria: null,
      telefono: '(809) 222-3333',
      sitio_web: 'https://conocida.com/',
      notas: null,
      cliente_id: null,
      created_at: ahoraISO(),
    })
    await page.getByRole('button', { name: 'Prospección' }).first().click()
    await page.getByRole('heading', { name: 'Prospección' }).waitFor({ timeout: 10000 })
    await page.getByLabel('Dirección de la web a prospectar').fill('conocida.com')
    await page.getByRole('button', { name: 'Buscar contactos' }).click()
    await page.getByRole('heading', { name: 'Panadería La Espiga' }).waitFor({ timeout: 20000 })
    await page.getByRole('button', { name: 'Guardar en el CRM' }).click()
    await page.getByRole('button', { name: 'Añadir contacto' }).waitFor({ timeout: 10000 })
    await page.getByText('Ya tienes «Cliente Conocido SRL» en el CRM').waitFor()
    afirmar(await page.getByRole('textbox', { name: 'Empresa *' }).isDisabled(), 'el nombre de la empresa existente no se edita')
    await page.screenshot({ path: `${CAPTURAS}/05-empresa-existente.png`, fullPage: true })
    await page.getByRole('button', { name: 'Añadir contacto' }).click()
    await page.getByText('y su contacto ya están en el CRM').waitFor({ timeout: 10000 })
    afirmar(store.crm_empresas.length === 2, `no se duplicó la empresa (hay ${store.crm_empresas.length})`)
    afirmar(store.crm_contactos.length === 2, `se añadió el contacto (hay ${store.crm_contactos.length})`)
    afirmar(store.crm_contactos[1].empresa_id === 'empresa-conocida', 'el contacto se ligó a la empresa existente')
    marcar('contacto añadido a una empresa existente')

    // ---------- Validación de dirección ----------
    await page.getByLabel('Dirección de la web a prospectar').fill('sinpunto')
    await page.getByRole('button', { name: 'Buscar contactos' }).click()
    await page.getByText(/Escribe un dominio completo/).waitFor({ timeout: 10000 })
    afirmar(llamadasScraper === 2, `la dirección inválida no llama a la API (llamadas: ${llamadasScraper})`)
    await page.screenshot({ path: `${CAPTURAS}/06-validacion.png`, fullPage: true })
    marcar('validación de dirección inválida')

    // ---------- Recarga (enlace profundo) ----------
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Prospección' }).waitFor({ timeout: 20000 })
    await page.getByText('Encuentra clientes potenciales').waitFor()
    afirmar(page.url().includes('#prospeccion'), 'la URL conserva #prospeccion')
    marcar('recarga con enlace profundo')

    // ---------- Vista móvil ----------
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('heading', { name: 'Prospección' }).waitFor()
    await page.screenshot({ path: `${CAPTURAS}/07-movil.png`, fullPage: true })
    marcar('vista móvil')

    afirmar(errores.length === 0, `sin errores de consola (encontrados: ${errores.join(' | ')})`)

    return {
      ok: true,
      pasos,
      erroresConsola: errores,
      empresas: store.crm_empresas.length,
      contactos: store.crm_contactos.length,
      llamadasScraper,
      capturas: [
        '01-inicio.png',
        '02-resultado.png',
        '03-modal.png',
        '04-guardado.png',
        '05-empresa-existente.png',
        '06-validacion.png',
        '07-movil.png',
      ],
    }
  }

  try {
    return await ejecutar()
  } catch (error) {
    const texto = await page
      .evaluate(() => document.body.innerText.slice(-900))
      .catch(() => '')
    return { ok: false, fallo: String(error), pasos, errores, texto }
  }
}
