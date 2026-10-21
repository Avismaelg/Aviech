// Prueba de humo de la PWA (service worker): armazón sin conexión.
// Uso: npm run build; npm run preview -- --port 5181 --strictPort;
//      luego ejecutar este archivo con la herramienta de Playwright (browser_run_code_unsafe + filename).
async (page) => {
  const BASE = 'http://localhost:5181'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-pwa'

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

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('about:blank')

  // Limpia cualquier sesión simulada que hayan dejado las pruebas anteriores
  // (sus init scripts la reescriben en cada navegación; este se ejecuta después).
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem('sb-ktvyhtbmokmrzeuibznv-auth-token')
    } catch {
      // about:blank bloquea localStorage; no pasa nada.
    }
  })

  const ejecutar = async () => {
    // ---------- Primera visita: acceso visible y service worker registrado ----------
    await page.goto(`${BASE}/panel`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'AviTech Panel' }).waitFor({ timeout: 20000 })
    await page.screenshot({ path: `${CAPTURAS}/01-acceso.png` })
    marcar('acceso visible')

    const registro = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { soportado: false, activo: false, alcance: '' }
      const listo = await navigator.serviceWorker.ready
      return { soportado: true, activo: Boolean(listo.active), alcance: listo.scope }
    })
    afirmar(registro.soportado, 'el navegador soporta service workers')
    afirmar(registro.activo, 'el service worker quedó activo')
    afirmar(registro.alcance === `${BASE}/`, `el alcance es la raíz del panel (fue ${registro.alcance})`)
    marcar('service worker activo')

    // Espera a que el service worker tome el control de la pestaña (activate → claim).
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 })

    // ---------- Recarga con el service worker al mando: guarda los recursos ----------
    await page.reload({ waitUntil: 'networkidle' })
    afirmar(
      await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      'la página quedó controlada por el service worker',
    )
    const recursos = await page.evaluate(
      () => performance.getEntriesByType('resource').filter((entrada) => entrada.name.includes('/assets/')).length,
    )
    afirmar(recursos > 0, 'los recursos de la app se cargaron')
    marcar('recarga controlada por el service worker')

    // ---------- Sin conexión: el armazón sigue abriendo ----------
    await page.context().setOffline(true)
    marcar('sin conexión activado')
    errores.length = 0
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: 'AviTech Panel' }).waitFor({ timeout: 20000 })
    await page.getByText('Acceso del personal').waitFor()
    await page.screenshot({ path: `${CAPTURAS}/02-sin-conexion.png` })
    afirmar(
      await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      'sin conexión la página siguió controlada por el service worker',
    )
    afirmar(errores.length === 0, `sin errores de consola sin conexión (encontrados: ${errores.join(' | ')})`)
    marcar('el panel abrió sin conexión')

    return {
      ok: true,
      pasos,
      erroresConsola: errores,
      alcance: registro.alcance,
      capturas: ['01-acceso.png', '02-sin-conexion.png'],
    }
  }

  try {
    return await ejecutar()
  } catch (error) {
    const texto = await page
      .evaluate(() => document.body.innerText.slice(-900))
      .catch(() => '')
    return { ok: false, fallo: String(error), pasos, errores, texto }
  } finally {
    await page.context().setOffline(false).catch(() => {})
  }
}
