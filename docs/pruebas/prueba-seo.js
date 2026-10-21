async (page) => {
  const BASE = 'http://localhost:5181'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-seo'
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
  const nuevoId = () => `auditoria-${++contador}`

  const store = { seo_auditorias: [] }

  const chequeosDe = (bueno) => [
    { id: 'https', grupo: 'tecnico', titulo: 'Conexión segura (HTTPS)', estado: 'bien', detalle: 'El sitio usa HTTPS.' },
    { id: 'estado', grupo: 'tecnico', titulo: 'Respuesta del servidor', estado: 'bien', detalle: 'Código HTTP 200.' },
    { id: 'titulo', grupo: 'contenido', titulo: 'Título de la página', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '36 caracteres (ideal: 30 a 65).' : 'No tiene <title>.' },
    { id: 'descripcion', grupo: 'contenido', titulo: 'Meta descripción', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '152 caracteres (ideal: 70 a 165).' : 'No tiene meta descripción.' },
    { id: 'h1', grupo: 'contenido', titulo: 'Encabezado principal (H1)', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '«Open source alternative to Semrush»' : '0 encabezados H1 (debe haber uno solo).' },
    { id: 'palabras', grupo: 'contenido', titulo: 'Contenido suficiente', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '≈ 691 palabras en la página.' : '≈ 43 palabras en la página.' },
    { id: 'imagenes', grupo: 'contenido', titulo: 'Imágenes con texto alternativo', estado: bueno ? 'bien' : 'mejorable', detalle: bueno ? '0 de 4 sin atributo alt; 1 con alt vacío.' : 'La página no tiene imágenes.' },
    { id: 'enlaces', grupo: 'contenido', titulo: 'Enlaces internos', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '71 internos y 18 externos.' : '0 internos y 2 externos.' },
    { id: 'datos', grupo: 'contenido', titulo: 'Datos estructurados (schema.org)', estado: bueno ? 'bien' : 'mejorable', detalle: bueno ? '2 bloque(s) JSON-LD.' : 'No se detectaron datos estructurados.' },
    { id: 'viewport', grupo: 'tecnico', titulo: 'Adaptado a móviles (viewport)', estado: bueno ? 'bien' : 'mal', detalle: bueno ? 'Declara width=device-width.' : 'Falta la meta viewport para móviles.' },
    { id: 'canonical', grupo: 'tecnico', titulo: 'URL canónica', estado: bueno ? 'bien' : 'mal', detalle: bueno ? 'Declara la URL principal.' : 'No declara una URL canónica.' },
    { id: 'robots', grupo: 'tecnico', titulo: 'Indexación permitida', estado: bueno ? 'bien' : 'mal', detalle: bueno ? 'Sin restricciones de indexación.' : 'La página tiene «noindex»: Google no la mostrará.' },
    { id: 'open-graph', grupo: 'tecnico', titulo: 'Vista previa en redes (Open Graph)', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '3 de 3 etiquetas (título, descripción e imagen).' : '0 de 3 etiquetas (título, descripción e imagen).' },
    { id: 'lang', grupo: 'tecnico', titulo: 'Idioma declarado', estado: bueno ? 'bien' : 'mejorable', detalle: bueno ? 'Idioma: en.' : 'La etiqueta <html> no declara idioma.' },
    { id: 'robots-txt', grupo: 'archivos', titulo: 'Archivo robots.txt', estado: bueno ? 'bien' : 'mejorable', detalle: bueno ? 'robots.txt accesible y declara 1 sitemap(s).' : 'No se encontró robots.txt (no es obligatorio, pero ayuda).' },
    { id: 'sitemap', grupo: 'archivos', titulo: 'Mapa del sitio (sitemap.xml)', estado: bueno ? 'bien' : 'mal', detalle: bueno ? '107 URL(s) declaradas.' : 'No se encontró sitemap.xml: a los buscadores les cuesta descubrir las páginas.' },
  ]

  const construirDatos = (url, puntaje) => {
    const bueno = puntaje >= 50
    const dominio = new URL(url).hostname.replace(/^www\./, '')
    return {
      url,
      urlFinal: url,
      dominio,
      httpStatus: 200,
      https: url.startsWith('https:'),
      tiempoMs: bueno ? 512 : 1480,
      bytes: bueno ? 72400 : 15300,
      recortado: false,
      contenido: {
        titulo: bueno ? 'OpenSEO - Open Source SEO Platform' : 'Ejemplo',
        tituloLargo: bueno ? 36 : 7,
        metaDescripcion: bueno ? 'Plataforma SEO de código abierto con datos que tú controlas.' : '',
        metaDescripcionLargo: bueno ? 62 : 0,
        h1: bueno ? ['Open source alternative to Semrush and Ahrefs'] : [],
        h1Cantidad: bueno ? 1 : 0,
        h2Cantidad: bueno ? 5 : 1,
        palabras: bueno ? 691 : 43,
        imagenesTotal: bueno ? 4 : 0,
        imagenesSinAlt: 0,
        imagenesAltVacio: bueno ? 1 : 0,
        enlacesInternos: bueno ? 71 : 0,
        enlacesExternos: bueno ? 18 : 2,
        enlacesNofollow: 0,
        datosEstructurados: bueno ? 2 : 0,
      },
      tecnico: {
        lang: bueno ? 'en' : '',
        viewport: bueno ? 'width=device-width, initial-scale=1' : '',
        viewportPresente: bueno,
        canonical: bueno ? url : '',
        metaRobots: '',
        noindex: false,
        ogTitulo: bueno,
        ogDescripcion: bueno,
        ogImagen: bueno,
        hreflang: 0,
      },
      archivos: {
        robotsExiste: bueno,
        robotsEstado: bueno ? 200 : 404,
        robotsSitemaps: bueno ? [`${url}sitemap.xml`] : [],
        robotsBloqueaTodo: false,
        sitemapUrl: `${url}sitemap.xml`,
        sitemapExiste: bueno,
        sitemapEstado: bueno ? 200 : 404,
        sitemapUrls: bueno ? 107 : 0,
        sitemapEsIndice: false,
      },
      chequeos: chequeosDe(bueno),
      puntaje,
      fecha: ahoraISO(),
    }
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

  // API del Auditor SEO (Worker): respuesta simulada (openseo.so bien, ejemplo.com mal).
  await page.route('**/api/seo/auditar**', async (ruta) => {
    const destino = new URL(ruta.request().url()).searchParams.get('url') || ''
    const esEjemplo = destino.includes('ejemplo.com')
    await ruta.fulfill({
      status: 200,
      headers: cabecerasJson,
      body: JSON.stringify(construirDatos(destino, esEjemplo ? 31 : 88)),
    })
  })

  // PageSpeed Insights: respuesta simulada.
  await page.route('**/pagespeedonline/**', async (ruta) => {
    await ruta.fulfill({
      status: 200,
      headers: cabecerasJson,
      body: JSON.stringify({
        lighthouseResult: {
          categories: {
            performance: { score: 0.92 },
            seo: { score: 0.98 },
            accessibility: { score: 0.88 },
            'best-practices': { score: 0.95 },
          },
          audits: {
            'largest-contentful-paint': { displayValue: '1.9 s' },
            'cumulative-layout-shift': { displayValue: '0.01' },
          },
        },
      }),
    })
  })

  await page.route('**/rest/v1/**', async (ruta) => {
    const peticion = ruta.request()
    if (peticion.method() === 'OPTIONS') return ruta.fulfill({ status: 204, headers: cabecerasCors })
    const url = new URL(peticion.url())
    const tabla = url.pathname.split('/rest/v1/')[1].split('/')[0]
    const datos = store[tabla]
    if (!datos) return ruta.fulfill({ status: 200, headers: cabecerasJson, body: '[]' })

    if (peticion.method() === 'GET') {
      const filas = [...datos].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
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
    if (peticion.method() === 'PATCH') {
      const cuerpo = JSON.parse(peticion.postData() || '{}')
      const id = (url.searchParams.get('id') || '').replace('eq.', '')
      const fila = datos.find((otra) => otra.id === id)
      if (fila) Object.assign(fila, cuerpo)
      return ruta.fulfill({ status: 200, headers: cabecerasJson, body: JSON.stringify(fila ? [fila] : []) })
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
    await page.goto(`${BASE}/panel#seo`, { waitUntil: 'networkidle' })
    marcar('auditor abierto por enlace profundo')

    // ---------- Estado inicial ----------
    await page.getByRole('heading', { name: 'Auditor SEO' }).waitFor({ timeout: 20000 })
    await page.getByText('Todavía no hay auditorías').waitFor()
    await page.getByRole('button', { name: 'Analizar sitio' }).waitFor()
    await page.screenshot({ path: `${CAPTURAS}/01-inicio.png`, fullPage: true })
    marcar('estado vacío visible')

    // ---------- Auditoría buena ----------
    await page.getByLabel('Dirección del sitio a auditar').fill('openseo.so')
    await page.getByRole('button', { name: 'Analizar sitio' }).click()
    await page.getByText('Buen estado').waitFor({ timeout: 20000 })
    afirmar(store.seo_auditorias.length === 1, 'se guardó 1 auditoría')
    afirmar(store.seo_auditorias[0].puntaje === 88, `el puntaje guardado es 88 (fue ${store.seo_auditorias[0]?.puntaje})`)
    afirmar(store.seo_auditorias[0].dominio === 'openseo.so', 'el dominio se guardó sin www')
    await page.getByText('Título de la página').waitFor()
    await page.getByText('Mapa del sitio (sitemap.xml)').waitFor()
    await page.getByText('107 URL(s) declaradas.').waitFor()
    afirmar((await page.getByRole('button', { name: 'Eliminar auditoría' }).count()) === 1, '1 fila en el historial')
    await page.screenshot({ path: `${CAPTURAS}/02-informe.png`, fullPage: true })
    marcar('auditoría de openseo.so lista')

    // ---------- Velocidad (PageSpeed simulado) ----------
    await page.getByRole('button', { name: 'Velocidad', exact: true }).click()
    await page.getByText('Rendimiento').waitFor({ timeout: 20000 })
    await page.getByText('Buenas prácticas').waitFor()
    afirmar(
      store.seo_auditorias[0].datos.velocidad?.performance === 92,
      `PageSpeed quedó guardado (fue ${store.seo_auditorias[0].datos.velocidad?.performance})`,
    )
    await page.getByText('LCP 1.9 s · CLS 0.01').waitFor()
    await page.screenshot({ path: `${CAPTURAS}/03-velocidad.png`, fullPage: true })
    marcar('velocidad medida y guardada')

    // ---------- Segunda auditoría (mal estado) ----------
    await page.getByLabel('Dirección del sitio a auditar').fill('ejemplo.com')
    await page.getByRole('button', { name: 'Analizar sitio' }).click()
    await page.getByText('Necesita atención').waitFor({ timeout: 20000 })
    afirmar(store.seo_auditorias.length === 2, 'se guardaron 2 auditorías')
    afirmar((await page.getByRole('button', { name: 'Eliminar auditoría' }).count()) === 2, '2 filas en el historial')
    await page.getByText('No tiene <title>.').waitFor()
    await page.screenshot({ path: `${CAPTURAS}/04-dos-auditorias.png`, fullPage: true })
    marcar('segunda auditoría con hallazgos')

    // ---------- Eliminar la auditoría mala ----------
    const filaEjemplo = page
      .getByRole('listitem')
      .filter({ has: page.getByText('ejemplo.com', { exact: false }) })
      .filter({ has: page.getByRole('button', { name: 'Eliminar auditoría' }) })
    await filaEjemplo.getByRole('button', { name: 'Eliminar auditoría' }).click()
    await page.getByRole('heading', { name: 'Eliminar auditoría' }).waitFor()
    await page.getByRole('button', { name: 'Eliminar', exact: true }).click()
    await page.getByRole('heading', { name: 'Eliminar auditoría' }).waitFor({ state: 'detached' })
    await page.getByText('Buen estado').waitFor()
    afirmar(store.seo_auditorias.length === 1, 'quedó 1 auditoría tras eliminar')
    afirmar((await page.getByRole('button', { name: 'Eliminar auditoría' }).count()) === 1, '1 fila tras eliminar')
    afirmar((await page.getByText('Necesita atención').count()) === 0, 'ya no se muestra la auditoría eliminada')
    marcar('auditoría eliminada')

    // ---------- Validación de dirección ----------
    await page.getByLabel('Dirección del sitio a auditar').fill('sinpunto')
    await page.getByRole('button', { name: 'Analizar sitio' }).click()
    await page.getByText(/Escribe un dominio completo/).waitFor({ timeout: 10000 })
    afirmar(store.seo_auditorias.length === 1, 'la dirección inválida no crea auditorías')
    await page.screenshot({ path: `${CAPTURAS}/05-validacion.png`, fullPage: true })
    marcar('validación de dirección inválida')

    // ---------- Recarga (enlace profundo + historial persistente) ----------
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Auditor SEO' }).waitFor({ timeout: 20000 })
    await page.getByText('Buen estado').waitFor({ timeout: 20000 })
    afirmar((await page.getByRole('button', { name: 'Eliminar auditoría' }).count()) === 1, 'el historial sobrevive a la recarga')
    afirmar(page.url().includes('#seo'), 'la URL conserva #seo')
    marcar('recarga con enlace profundo')

    // ---------- Vista móvil ----------
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('heading', { name: 'Auditor SEO' }).waitFor()
    await page.screenshot({ path: `${CAPTURAS}/06-movil.png`, fullPage: true })
    marcar('vista móvil')

    afirmar(errores.length === 0, `sin errores de consola (encontrados: ${errores.join(' | ')})`)

    return {
      ok: true,
      pasos,
      erroresConsola: errores,
      auditorias: store.seo_auditorias.length,
      puntajeOpenseo: store.seo_auditorias[0]?.puntaje ?? null,
      velocidad: store.seo_auditorias[0]?.datos?.velocidad ?? null,
      capturas: [
        '01-inicio.png',
        '02-informe.png',
        '03-velocidad.png',
        '04-dos-auditorias.png',
        '05-validacion.png',
        '06-movil.png',
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
