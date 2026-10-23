// Prueba de humo de la página de ejemplo «securify» (Playwright).
// Uso: npm run build; npm run preview -- --port 5181 --strictPort;
//      luego ejecutar este archivo con la herramienta de Playwright.
async (page) => {
  const BASE = 'http://localhost:5181'
  const RUTA = `${BASE}/ejemplo/securify`
  const CAPTURAS = 'C:/Users/User/avitech/capturas-ejemplo'

  const pasos = []
  const marcar = (nombre) => pasos.push(nombre)
  const afirmar = (condicion, mensaje) => {
    if (!condicion) throw new Error(`FALLÓ: ${mensaje}`)
  }

  const errores = []
  page.on('console', (mensaje) => {
    if (mensaje.type() === 'error') errores.push(`console: ${mensaje.text()}`)
  })
  page.on('pageerror', (error) => errores.push(`pageerror: ${String(error)}`))

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(RUTA, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'protect', exact: true }).waitFor({ timeout: 20000 })

  afirmar((await page.title()) === 'securify · ejemplo', 'el título de la demo es propio')
  afirmar((await page.locator('html').getAttribute('lang')) === 'en', 'el idioma del documento es inglés')
  afirmar(
    ((await page.locator('meta[name="robots"]').getAttribute('content')) || '').includes('noindex'),
    'la demo lleva noindex',
  )

  const titulos = await page.locator('h1').allInnerTexts()
  afirmar(titulos.join(' ').toLowerCase() === 'protect your data', 'los tres titulares son protect / your / data')
  const familiaTitular = await page
    .locator('h1')
    .first()
    .evaluate((elemento) => getComputedStyle(elemento).fontFamily)
  afirmar(familiaTitular.includes('Readex Pro'), 'los titulares usan Readex Pro')

  const video = page.locator('video')
  afirmar((await video.count()) === 1, 'hay un solo video de fondo')
  const atributos = await video.evaluate((elemento) => ({
    src: elemento.getAttribute('src') || '',
    autoplay: elemento.autoplay,
    loop: elemento.loop,
    muted: elemento.muted,
    playsInline: elemento.playsInline,
  }))
  afirmar(atributos.src.endsWith('.mp4'), 'el video apunta al MP4 de la plantilla')
  afirmar(
    atributos.autoplay && atributos.loop && atributos.muted && atributos.playsInline,
    'el video es autoplay, loop, muted y playsInline',
  )
  await page.waitForFunction(
    () => {
      const elemento = document.querySelector('video')
      return elemento instanceof HTMLVideoElement && elemento.readyState >= 2 && !elemento.paused
    },
    { timeout: 30000 },
  )

  for (const enlace of ['platform', 'solutions', 'company', 'support']) {
    afirmar(
      await page.getByRole('link', { name: enlace, exact: true }).isVisible(),
      `el enlace ${enlace} se ve en escritorio`,
    )
  }
  afirmar(await page.getByText('+65k', { exact: true }).isVisible(), 'se ve la estadística +65k')
  afirmar(await page.getByText('+1.5b', { exact: true }).isVisible(), 'se ve la estadística +1.5b')
  afirmar(await page.getByText('+300k', { exact: true }).isVisible(), 'se ve la estadística +300k')

  const desbordeEscritorio = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  afirmar(desbordeEscritorio <= 0, 'sin desbordes horizontales a 1440 px')
  await page.screenshot({ path: `${CAPTURAS}/01-securify-escritorio.png` })
  marcar('escritorio: video, titulares, navegación y estadísticas')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'protect', exact: true }).waitFor({ timeout: 20000 })
  afirmar(
    !(await page.getByRole('link', { name: 'platform', exact: true }).isVisible()),
    'en móvil se ocultan los enlaces del centro',
  )
  const desbordeMovil = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  afirmar(desbordeMovil <= 0, 'sin desbordes horizontales a 390 px')
  await page.screenshot({ path: `${CAPTURAS}/02-securify-movil.png` })
  marcar('móvil: enlaces ocultos y sin desbordes')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'protect', exact: true }).waitFor({ timeout: 20000 })
  await page.waitForFunction(
    () => {
      const elemento = document.querySelector('video')
      return elemento instanceof HTMLVideoElement && elemento.readyState >= 2 && elemento.paused
    },
    { timeout: 30000 },
  )
  afirmar(
    await page.getByRole('heading', { name: 'data', exact: true }).isVisible(),
    'el contenido sigue visible con movimiento reducido',
  )
  marcar('movimiento reducido: video pausado y contenido visible')

  return { ok: errores.length === 0, pasos, errores }
}
