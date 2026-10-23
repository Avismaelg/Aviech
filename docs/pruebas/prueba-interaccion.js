// Prueba de humo de la interactividad del sitio (Playwright).
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

  const ejecutar = async () => {
    // ---------- Hero: partículas, parallax y clic ----------
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: /Digitalizamos tu empresa/ }).waitFor({ timeout: 20000 })
    await page.waitForTimeout(300)

    const escena = page.locator('[data-hero-escena]')
    const leerEscena = () =>
      escena.evaluate((el) => ({
        px: getComputedStyle(el).getPropertyValue('--px').trim(),
        py: getComputedStyle(el).getPropertyValue('--py').trim(),
        reaccion: el.getAttribute('data-reaccion'),
      }))

    const canvas = await page.locator('canvas[aria-hidden]').first().evaluate((el) => ({
      width: el.width,
      height: el.height,
      pointerEvents: getComputedStyle(el).pointerEvents,
    }))
    const antes = await leerEscena()
    await page.mouse.move(1120, 360)
    await page.waitForTimeout(550)
    const despues = await leerEscena()

    afirmar(canvas.width > 0 && canvas.height > 0, 'el canvas de partículas tiene tamaño')
    afirmar(canvas.pointerEvents === 'none', 'el canvas no bloquea los clics')
    afirmar(
      antes.px !== despues.px || antes.py !== despues.py,
      'el parallax del hero reacciona al puntero',
    )

    await escena.click({ position: { x: 260, y: 240 } })
    await page
      .waitForFunction(
        () => document.querySelector('[data-hero-escena]')?.getAttribute('data-reaccion') === 'true',
        null,
        { timeout: 3000 },
      )
      .catch(() => {})
    afirmar((await escena.getAttribute('data-reaccion')) === 'true', 'el clic activa la reacción del hero')
    await page.screenshot({ path: `${CAPTURAS}/21-hero-interaccion.png` })
    marcar('hero con partículas, parallax y clic')

    // ---------- Bóveda 3D: gira con el puntero y las fichas responden ----------
    const boveda = page.locator('.boveda')
    const ficha = page.locator('.boveda-chip-lejos').first()
    const leerMovimiento = () =>
      Promise.all([
        boveda.evaluate((el) => getComputedStyle(el).transform),
        ficha.evaluate((el) => getComputedStyle(el).transform),
      ])
    const [bovedaAntes, fichaAntes] = await leerMovimiento()
    await page.mouse.move(150, 160)
    await page.waitForTimeout(600)
    const [bovedaDespues, fichaDespues] = await leerMovimiento()
    afirmar(bovedaAntes !== bovedaDespues, 'la bóveda gira con el puntero')
    afirmar(fichaAntes !== fichaDespues, 'las fichas responden a su profundidad')
    afirmar((await page.locator('.boveda-orbita').count()) === 2, 'la bóveda tiene sus dos anillos orbitales')
    marcar('bóveda 3D sigue el puntero')

    // ---------- Botón magnético ----------
    const ctaHero = page.getByRole('button', { name: 'Solicitar una propuesta' })
    const cajaCta = await ctaHero.boundingBox()
    await page.mouse.move(cajaCta.x + cajaCta.width * 0.92, cajaCta.y + cajaCta.height * 0.8)
    await page.waitForTimeout(350)
    const iman = await ctaHero.evaluate((el) => el.style.getPropertyValue('--iman-x'))
    afirmar(iman !== '' && iman !== '0.00px', `el botón principal se desplaza hacia el puntero (${iman})`)
    await page.mouse.move(150, 160)
    await page.waitForTimeout(350)
    const imanSalida = await ctaHero.evaluate((el) => el.style.getPropertyValue('--iman-x'))
    afirmar(imanSalida === '0px', 'el botón vuelve a su sitio al salir')
    marcar('botón magnético')

    // ---------- Línea de proceso que avanza con el scroll ----------
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(250)
    const proceso = page.locator('#proceso')
    const progresoAntes = await proceso.evaluate((el) => Number(el.style.getPropertyValue('--progreso')))
    await page.evaluate(() => {
      document.getElementById('proceso')?.scrollIntoView({ block: 'center' })
    })
    await page.waitForTimeout(400)
    const progresoDespues = await proceso.evaluate((el) => Number(el.style.getPropertyValue('--progreso')))
    afirmar(progresoAntes === 0, `la línea de proceso empieza vacía (${progresoAntes})`)
    afirmar(progresoDespues > 0.4, `la línea de proceso avanza al recorrerla (${progresoDespues})`)
    await page.screenshot({ path: `${CAPTURAS}/25-proceso-avance.png` })
    marcar('línea de proceso con avance')

    // ---------- Tarjetas: inclinación, brillo y detalle ----------
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto'
    })
    const tarjeta = page.locator('#soluciones article').first()
    await tarjeta.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)

    const leerTarjeta = () =>
      tarjeta.evaluate((el) => {
        const brillo = el.querySelector('.tarjeta-brillo')
        const detalle = el.querySelector('.detalle-tarjeta')
        return {
          rx: getComputedStyle(el).getPropertyValue('--rx').trim(),
          ry: getComputedStyle(el).getPropertyValue('--ry').trim(),
          brillo: brillo ? getComputedStyle(brillo).opacity : null,
          detalle: detalle ? getComputedStyle(detalle).opacity : null,
        }
      })

    const tarjetaAntes = await leerTarjeta()
    const barraAntes = await tarjeta.evaluate((el) => getComputedStyle(el, '::before').transform)
    const caja = await tarjeta.boundingBox()
    await page.mouse.move(caja.x + caja.width * 0.78, caja.y + caja.height * 0.22)
    await page.waitForTimeout(450)
    const tarjetaDespues = await leerTarjeta()
    const barraDespues = await tarjeta.evaluate((el) => getComputedStyle(el, '::before').transform)
    afirmar(barraAntes !== barraDespues, 'el filete de marca de la tarjeta se revela con el puntero')
    afirmar(
      tarjetaAntes.rx !== tarjetaDespues.rx || tarjetaAntes.ry !== tarjetaDespues.ry,
      'la tarjeta se inclina con el puntero',
    )
    afirmar(tarjetaDespues.brillo === '1', 'el brillo de la tarjeta aparece')
    afirmar(tarjetaDespues.detalle === '1', 'el detalle de la tarjeta aparece')
    await page.screenshot({ path: `${CAPTURAS}/22-tarjeta-interactiva.png` })

    await tarjeta.getByRole('button', { name: 'Consultar este servicio' }).focus()
    await page.waitForTimeout(250)
    const tarjetaFoco = await leerTarjeta()
    afirmar(tarjetaFoco.brillo === '1', 'el brillo aparece con foco de teclado')
    afirmar(tarjetaFoco.detalle === '1', 'el detalle aparece con foco de teclado')
    marcar('tarjetas con inclinación, brillo y detalle')

    // ---------- Navegación y botones ----------
    const enlaceNav = page.locator('nav[aria-label="Navegación principal"] a').first()
    const navAntes = await enlaceNav.evaluate((el) => getComputedStyle(el, '::after').transform)
    await enlaceNav.hover()
    await page.waitForTimeout(260)
    const navDespues = await enlaceNav.evaluate((el) => getComputedStyle(el, '::after').transform)
    afirmar(navAntes !== navDespues, 'la navegación muestra su subrayado al pasar el ratón')

    const cta = page.getByRole('link', { name: 'Solicitar propuesta' }).first()
    const svgAntes = await cta.locator('svg').evaluate((el) => getComputedStyle(el).transform)
    await cta.hover()
    await page.waitForTimeout(260)
    const svgDespues = await cta.locator('svg').evaluate((el) => getComputedStyle(el).transform)
    afirmar(svgAntes !== svgDespues, 'el botón mueve su icono al pasar el ratón')
    marcar('navegación y botones con estados visibles')

    // ---------- Aparición al hacer scroll ----------
    const paquetes = page.locator('#paquetes [data-revelar]')
    const paquetesAntes = await paquetes.getAttribute('data-visible')
    await page.evaluate(() => {
      document.getElementById('paquetes')?.scrollIntoView({ block: 'start' })
    })
    await page.waitForTimeout(900)
    const paquetesDespues = await paquetes.getAttribute('data-visible')
    const paquetesOpacidad = await paquetes.evaluate((el) => getComputedStyle(el).opacity)
    afirmar(paquetesAntes !== 'true', 'la sección no se revela antes de entrar en pantalla')
    afirmar(paquetesDespues === 'true', 'la sección se revela al hacer scroll')
    afirmar(paquetesOpacidad === '1', 'la sección revelada queda visible')
    await page.screenshot({ path: `${CAPTURAS}/23-scroll-reveal.png` })
    marcar('aparición de secciones al hacer scroll')

    // ---------- Móvil: sin desbordes ----------
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Abrir menú' }).waitFor()
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    afirmar(desborde <= 1, `sin desbordes horizontales en móvil (${desborde}px)`)
    await page.screenshot({ path: `${CAPTURAS}/24-movil-interaccion.png` })
    marcar('móvil sin desbordes')

    // ---------- Movimiento reducido ----------
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: /Digitalizamos tu empresa/ }).waitFor()
    const reducido = await page.evaluate(() => {
      const revelar = document.querySelectorAll('[data-revelar]')
      const tarjeta = document.querySelector('#soluciones article')
      const escena = document.querySelector('[data-hero-escena]')
      const boveda = document.querySelector('.boveda')
      const costuras = document.querySelector('.boveda-costuras')
      const cta = Array.from(document.querySelectorAll('button')).find(
        (boton) => boton.textContent?.trim() === 'Solicitar una propuesta',
      )
      const proceso = document.getElementById('proceso')
      return {
        revelarVisibles: Array.from(revelar).every(
          (nodo) => nodo.getAttribute('data-visible') === 'true',
        ),
        opacidad: revelar[0] ? getComputedStyle(revelar[0]).opacity : null,
        tarjeta: tarjeta ? getComputedStyle(tarjeta).transform : null,
        escena: escena ? getComputedStyle(escena).transform : null,
        boveda: boveda ? getComputedStyle(boveda).transform : null,
        costuras: costuras ? getComputedStyle(costuras).animationName : null,
        iman: cta ? cta.style.getPropertyValue('--iman-x') : null,
        progreso: proceso ? proceso.style.getPropertyValue('--progreso') : null,
      }
    })
    afirmar(reducido.revelarVisibles, 'con movimiento reducido todo el contenido es visible')
    afirmar(reducido.opacidad === '1', 'con movimiento reducido no queda opacidad pendiente')
    afirmar(reducido.tarjeta === 'none', 'con movimiento reducido la tarjeta no se transforma')
    afirmar(reducido.escena === 'none', 'con movimiento reducido la escena no se transforma')
    afirmar(reducido.boveda === 'none', 'con movimiento reducido la bóveda queda plana')
    afirmar(reducido.costuras === 'none', 'con movimiento reducido las costuras no giran')
    afirmar(reducido.iman === '', 'con movimiento reducido el botón no se desplaza')
    afirmar(reducido.progreso === '1', 'con movimiento reducido la línea de proceso aparece completa')
    marcar('movimiento reducido respetado')
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    afirmar(errores.length === 0, `sin errores de consola (encontrados: ${errores.join(' | ')})`)
  }

  try {
    await ejecutar()
    return { ok: true, pasos, errores }
  } catch (fallo) {
    return {
      ok: false,
      pasos,
      errores,
      fallo: fallo instanceof Error ? fallo.message : String(fallo),
    }
  }
}
