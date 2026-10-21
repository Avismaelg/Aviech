// Prueba de humo del sitio comercial (Playwright).
// Uso: npm run build; npm run preview -- --port 5181 --strictPort;
//      luego ejecutar este archivo con la herramienta de Playwright (browser_run_code_unsafe + filename).
async (page) => {
  const BASE = 'http://localhost:5181'
  const CAPTURAS = 'C:/Users/User/avitech/capturas-sitio'

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

  // Ninguna sesión simulada de pruebas anteriores debe abrir el panel.
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem('sb-ktvyhtbmokmrzeuibznv-auth-token')
    } catch {
      // about:blank bloquea localStorage; no pasa nada.
    }
  })

  let solicitudRecibida = null
  await page.route('**/api/solicitudes', async (ruta) => {
    if (ruta.request().method() !== 'POST') return ruta.continue()
    solicitudRecibida = JSON.parse(ruta.request().postData() || '{}')
    await ruta.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        folio: 'SITIO123',
        mensaje: 'Recibimos tu solicitud. La IA está preparando el análisis.',
      }),
    })
  })

  const ejecutar = async () => {
    // ---------- Portada y contenido ----------
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: /Digitalizamos tu empresa/ }).waitFor({ timeout: 20000 })
    afirmar((await page.title()).includes('AviTech'), 'el título de la página es de AviTech')
    afirmar((await page.locator('h1').innerText()).includes('Simplificamos tu operación'), 'el H1 usa el mensaje principal')
    afirmar((await page.locator('#soluciones article').count()) === 4, 'hay 4 servicios')
    afirmar((await page.locator('#necesidades button').count()) === 6, 'hay 6 necesidades')
    afirmar((await page.locator('#paquetes article').count()) === 4, 'hay 4 paquetes')
    afirmar((await page.locator('#preguntas details').count()) === 8, 'hay 8 preguntas frecuentes')
    afirmar((await page.getByText('Demostración', { exact: true }).count()) >= 3, 'las 3 demostraciones están marcadas')
    await page.screenshot({ path: `${CAPTURAS}/07-sitio-completo.png`, fullPage: true })
    marcar('portada, servicios, necesidades, paquetes, FAQ y demostraciones')

    // ---------- Páginas legales ----------
    await page.goto(`${BASE}/privacidad`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Política de privacidad' }).waitFor()
    afirmar((await page.getByText('Última actualización').count()) >= 1, 'la privacidad muestra su fecha')
    await page.goto(`${BASE}/terminos`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Términos del servicio' }).waitFor()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: /Digitalizamos tu empresa/ }).waitFor()
    marcar('páginas legales')

    // ---------- Una necesidad preselecciona el servicio ----------
    await page.getByRole('button', { name: 'Necesito una página web', exact: true }).click()
    await page.waitForTimeout(700)
    const servicioElegido = await page.locator('#contacto-servicio').inputValue()
    afirmar(servicioElegido === 'web', `la necesidad preselecciona el servicio web (fue ${servicioElegido})`)
    marcar('necesidad preselecciona el servicio')

    // ---------- Validación del formulario ----------
    await page.getByRole('button', { name: 'Enviar solicitud' }).click()
    await page.getByText('Escribe tu nombre.').waitFor()
    afirmar(await page.getByText('Escribe un correo válido para contactarte.').isVisible(), 'valida el correo')
    afirmar(await page.getByText('Cuéntanos un poco más: al menos 20 caracteres.').isVisible(), 'valida la descripción')
    afirmar(await page.getByText('Marca la autorización para usar tus datos').isVisible(), 'exige el consentimiento')
    afirmar(solicitudRecibida === null, 'no se envió nada con el formulario incompleto')
    await page.screenshot({ path: `${CAPTURAS}/08-contacto-errores.png` })
    marcar('validación del formulario')

    // ---------- Envío real contra el endpoint (interceptado) ----------
    await page.locator('#contacto-nombre').fill('Ana Pérez')
    await page.locator('#contacto-empresa').fill('Ferretería Pérez SRL')
    await page.locator('#contacto-email').fill('ana@ferreteriaperez.do')
    await page.locator('#contacto-telefono').fill('809 555 0101')
    await page.locator('#contacto-descripcion').fill(
      'Necesitamos una página web para mostrar el catálogo y recibir solicitudes de clientes.',
    )
    await page.locator('#contacto-presupuesto').fill('25000')
    await page.getByLabel(/Autorizo a AviTech/).check()
    await page.getByRole('button', { name: 'Enviar solicitud' }).click()
    await page.getByRole('heading', { name: 'Recibimos tu solicitud' }).waitFor()
    afirmar(await page.getByText('SITIO123').isVisible(), 'la confirmación muestra el folio real')
    afirmar(solicitudRecibida !== null, 'la solicitud llegó al endpoint')
    afirmar(solicitudRecibida.nombre === 'Ana Pérez', 'el nombre viaja en la solicitud')
    afirmar(solicitudRecibida.tipo === 'implementacion', `el tipo interno es implementacion (fue ${solicitudRecibida.tipo})`)
    afirmar(solicitudRecibida.urgencia === 'media', `el plazo por defecto es media (fue ${solicitudRecibida.urgencia})`)
    afirmar(solicitudRecibida.presupuesto === 25000, 'el presupuesto viaja como número')
    afirmar(solicitudRecibida.consentimiento === true, 'el consentimiento viaja explícito')
    afirmar(solicitudRecibida.website === '', 'el honeypot viaja vacío')
    afirmar(
      String(solicitudRecibida.descripcion).includes('Servicio de interés: Páginas web y presencia digital'),
      'la descripción conserva el servicio elegido',
    )
    afirmar(
      String(solicitudRecibida.titulo).includes('Páginas web y presencia digital'),
      'el título identifica el servicio',
    )
    await page.screenshot({ path: `${CAPTURAS}/09-contacto-exito.png` })
    marcar('envío verificado y confirmación con folio')

    // ---------- Reinicio del formulario ----------
    await page.getByRole('button', { name: 'Enviar otra solicitud' }).click()
    afirmar((await page.locator('#contacto-nombre').inputValue()) === '', 'el formulario se limpia al reiniciar')
    marcar('formulario reiniciado')

    // ---------- Móvil: menú y desbordes ----------
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    afirmar(await page.locator('#menu-sitio').isVisible(), 'el menú móvil se abre')
    await page.locator('#menu-sitio').getByRole('link', { name: 'Soluciones', exact: true }).click()
    await page.waitForTimeout(600)
    afirmar(!(await page.locator('#menu-sitio').isVisible()), 'el menú se cierra al navegar')
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    afirmar(desborde <= 1, `sin desbordes horizontales en móvil (${desborde}px)`)
    await page.screenshot({ path: `${CAPTURAS}/10-movil.png`, fullPage: true })
    marcar('móvil sin desbordes y menú funcional')

    // ---------- El panel sigue en /panel y los enlaces viejos redirigen ----------
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${BASE}/panel`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'AviTech Panel' }).waitFor({ timeout: 20000 })
    afirmar(page.url().includes('/panel'), 'el panel vive en /panel')
    marcar('panel en /panel')

    await page.goto(`${BASE}/#crm`, { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.waitForURL(/\/panel#crm/, { timeout: 10000 })
    afirmar(page.url().includes('/panel#crm'), 'el enlace viejo /#crm redirige a /panel#crm')
    await page.getByRole('heading', { name: 'AviTech Panel' }).waitFor({ timeout: 20000 })
    marcar('redirección de enlaces antiguos')
  }

  try {
    await ejecutar()
    afirmar(errores.length === 0, `sin errores de consola (encontrados: ${errores.join(' | ')})`)
    return {
      ok: true,
      pasos,
      errores,
      solicitud: solicitudRecibida
        ? {
            tipo: solicitudRecibida.tipo,
            urgencia: solicitudRecibida.urgencia,
            presupuesto: solicitudRecibida.presupuesto,
            consentimiento: solicitudRecibida.consentimiento,
          }
        : null,
    }
  } catch (fallo) {
    return {
      ok: false,
      pasos,
      errores,
      fallo: fallo instanceof Error ? fallo.message : String(fallo),
    }
  }
}
