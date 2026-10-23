// Prueba de humo de la portada Orbit (HTML estático servido por el Worker).
// Uso: npm run build; npx wrangler dev --port 8792 --ip 127.0.0.1;
//      luego ejecutar este archivo con la herramienta de Playwright
//      (browser_run_code_unsafe + filename).
// No toca Supabase ni la API. Las capturas van a C:\Users\User\avitech\capturas-orbit.
async (page) => {
  const BASE = 'http://127.0.0.1:8792'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-orbit'

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
  const cerca = (valor, esperado, tolerancia, nombre) => {
    afirmar(Math.abs(valor - esperado) <= tolerancia, `${nombre}: ${valor} (esperado ${esperado} ± ${tolerancia})`)
  }
  const cargar = async (ruta) => {
    await page.goto(`${BASE}${ruta}?prueba=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(2500)
  }
  const metricas = () =>
    page.evaluate(() => {
      const q = (s) => document.querySelector(s)
      const cs = (s) => getComputedStyle(q(s))
      const rect = (s) => {
        const b = q(s).getBoundingClientRect()
        return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom }
      }
      return {
        u: parseFloat(cs('h1').fontSize) / 55,
        bar: rect('.bar'),
        pill: rect('.pill'),
        p: { ...rect('.hero p'), lineHeight: parseFloat(cs('.hero p').lineHeight), width: parseFloat(cs('.hero p').width) },
        cta: rect('.cta'),
        h1: cs('h1').fontSize,
        links: cs('.links').display,
        solid: cs('.actions > .solid').display,
        menu: cs('.menu').display,
        scrollW: document.documentElement.scrollWidth,
        scrollH: document.documentElement.scrollHeight,
        innerW: innerWidth,
        innerH: innerHeight,
        htmlClass: document.documentElement.className,
        video: {
          paused: q('.sky').paused,
          muted: q('.sky').muted,
          loop: q('.sky').loop,
          playsInline: q('.sky').playsInline,
          readyState: q('.sky').readyState,
        },
      }
    })

  try {
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    // ---------- 1563×1006: composición de referencia ----------
    await page.setViewportSize({ width: 1563, height: 1006 })
    await cargar('/')
    const escritorio = await metricas()
    afirmar((await page.title()) === 'Orbit — See beyond now', 'título de Orbit')
    afirmar(
      (await page.locator('meta[name="description"]').getAttribute('content')) ===
        'Everything you need to discover, understand, and explore what is out there.',
      'descripción exacta',
    )
    afirmar((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim() === 'See beyond now Explore the stars', 'titular de dos líneas')
    afirmar((await page.locator('.hero p').innerText()) === 'Everything you need to discover, understand, and explore what is out there.', 'subtítulo exacto')
    afirmar(escritorio.innerW === 1563 && escritorio.innerH === 1006, 'viewport de referencia')
    afirmar(escritorio.scrollW <= escritorio.innerW + 1 && escritorio.scrollH <= escritorio.innerH + 1, 'nada hace scroll')
    cerca(escritorio.bar.x, 286, 1, 'barra left')
    cerca(escritorio.bar.w, 983.5, 1, 'barra width')
    cerca(escritorio.bar.y, 7.5, 0.5, 'barra top')
    cerca(escritorio.bar.h, 36.2, 0.5, 'barra height')
    cerca(escritorio.pill.y, 129.6, 0.6, 'pill top')
    cerca(escritorio.pill.w, 194.5, 0.6, 'pill width')
    cerca(escritorio.pill.h, 22.4, 0.6, 'pill height')
    cerca(escritorio.p.w, 700, 1, 'subtítulo width')
    cerca(escritorio.p.lineHeight, 24, 0.1, 'subtítulo line-height')
    cerca(escritorio.cta.y, 342.8, 0.6, 'CTA top')
    cerca(parseFloat(escritorio.h1), 55, 0.5, 'H1 font-size')
    afirmar(escritorio.htmlClass === '', 'la entrada terminó y limpió las clases')
    afirmar(!escritorio.video.paused && escritorio.video.muted && escritorio.video.loop && escritorio.video.playsInline, 'video reproduciéndose, silenciado, en bucle e inline')
    await page.screenshot({ path: `${CAPTURAS}/prueba-desktop-1563x1006.png`, timeout: 30000, scale: 'css' })
    marcar('escritorio 1563×1006 y video')

    // ---------- 390×844: móvil, menú y sin desbordes ----------
    await page.setViewportSize({ width: 390, height: 844 })
    await cargar('/')
    const movil = await metricas()
    afirmar(movil.innerW === 390 && movil.innerH === 844, 'viewport móvil')
    afirmar(movil.links === 'none', 'enlaces de escritorio ocultos')
    afirmar(movil.solid === 'none', 'botón sólido de cabecera oculto')
    afirmar(movil.menu !== 'none', 'botón de menú visible')
    cerca(movil.p.lineHeight, (390 / 486) * 23, 0.2, 'subtítulo móvil line-height')
    afirmar(movil.scrollW <= movil.innerW + 1 && movil.scrollH <= movil.innerH + 1, 'móvil sin scroll')
    afirmar(movil.p.bottom < movil.cta.y, 'subtítulo y CTA no se solapan')
    await page.click('#menu-btn')
    afirmar((await page.locator('#menu-btn').getAttribute('aria-expanded')) === 'true', 'menú abierto con aria-expanded')
    afirmar((await page.locator('#menu-btn').getAttribute('aria-label')) === 'Close menu', 'aria-label de cierre')
    afirmar((await page.locator('#menu-sheet').evaluate((e) => getComputedStyle(e).display)) === 'block', 'hoja visible')
    await page.mouse.click(10, 700)
    afirmar((await page.locator('#menu-btn').getAttribute('aria-expanded')) === 'false', 'clic fuera cierra')
    await page.click('#menu-btn')
    await page.keyboard.press('Escape')
    afirmar((await page.locator('#menu-btn').getAttribute('aria-expanded')) === 'false', 'Escape cierra')
    await page.screenshot({ path: `${CAPTURAS}/prueba-mobile-390x844.png`, timeout: 30000, scale: 'css' })
    marcar('móvil 390×844 y menú')

    // ---------- 640×500 y 320×568: casos cortos ----------
    await page.setViewportSize({ width: 640, height: 500 })
    await cargar('/')
    const corto = await metricas()
    cerca(corto.u, Math.min(640 / 900, 500 / 470), 0.01, 'u corto')
    afirmar(corto.p.bottom < corto.cta.y, '640×500 sin solape')
    afirmar(corto.scrollW <= corto.innerW + 1 && corto.scrollH <= corto.innerH + 1, '640×500 sin scroll')

    await page.setViewportSize({ width: 320, height: 568 })
    await cargar('/')
    const pequeno = await metricas()
    afirmar(pequeno.p.bottom < pequeno.cta.y, '320×568 sin solape')
    afirmar(pequeno.scrollW <= pequeno.innerW + 1 && pequeno.scrollH <= pequeno.innerH + 1, '320×568 sin scroll')
    marcar('640×500 y 320×568')

    // ---------- Ultra-wide 3/1 ----------
    await page.setViewportSize({ width: 3000, height: 1000 })
    await cargar('/')
    const ultra = await page.evaluate(() => {
      const s = document.querySelector('.sky')
      const v = document.querySelector('.veil')
      return {
        skyBottom: getComputedStyle(s).bottom,
        skyMinHeight: getComputedStyle(s).minHeight,
        veil: getComputedStyle(v).backgroundImage,
        scrollW: document.documentElement.scrollWidth,
        scrollH: document.documentElement.scrollHeight,
      }
    })
    afirmar(ultra.skyBottom === '0px', 'ultra-wide ancla el video abajo')
    afirmar(ultra.skyMinHeight === '0px', 'ultra-wide quita min-height')
    afirmar(ultra.veil.includes('linear-gradient'), 'ultra-wide usa el velo en degradado')
    afirmar(ultra.scrollW <= 3000 && ultra.scrollH <= 1000, 'ultra-wide sin scroll')
    await page.screenshot({ path: `${CAPTURAS}/prueba-ultrawide-3000x1000.png`, timeout: 30000, scale: 'css' })
    marcar('ultra-wide 3000×1000')

    // ---------- Movimiento reducido ----------
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1563, height: 1006 })
    await cargar('/')
    const reducido = await page.evaluate(() => ({
      htmlClass: document.documentElement.className,
      brandOpacity: getComputedStyle(document.querySelector('.brand')).opacity,
      brandAnimation: getComputedStyle(document.querySelector('.brand')).animationName,
    }))
    afirmar(reducido.htmlClass === '', 'movimiento reducido no añade intro')
    afirmar(reducido.brandOpacity === '1', 'movimiento reducido deja el contenido visible')
    afirmar(reducido.brandAnimation === 'none', 'movimiento reducido sin animación')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    marcar('prefers-reduced-motion')

    // ---------- Integración: panel, ruta desconocida ----------
    const respuestaPanel = await page.goto(`${BASE}/panel`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.getByRole('heading', { name: 'AviTech Panel' }).waitFor({ timeout: 20000 })
    afirmar(respuestaPanel.status() === 200, '/panel responde 200')
    afirmar((await page.title()).includes('AviTech'), '/panel conserva el armazón de React')
    const respuesta404 = await page.goto(`${BASE}/ruta-que-no-existe-orbit`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    afirmar(respuesta404.status() === 404, 'ruta desconocida responde 404 real')
    // El 404 de esta comprobación es intencional; no cuenta como error de la portada.
    for (let i = errores.length - 1; i >= 0; i -= 1) {
      if (errores[i].includes('404 (Not Found)')) errores.splice(i, 1)
    }
    marcar('integración con panel y 404')

    return { ok: true, pasos, erroresConsola: errores, capturas: [
      'prueba-desktop-1563x1006.png',
      'prueba-mobile-390x844.png',
      'prueba-ultrawide-3000x1000.png',
    ] }
  } catch (error) {
    return { ok: false, fallo: String(error), pasos, errores }
  }
}
