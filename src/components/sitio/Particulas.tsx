import { useEffect, useRef } from 'react'

interface Particula {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/**
 * Red de partículas del hero. Canvas ligero, sin dependencias.
 *
 * - Se pausa cuando el hero sale de pantalla o la pestaña se oculta.
 * - En móvil o equipos con pocos núcleos usa menos partículas y no reacciona
 *   al puntero, para no gastar batería.
 * - Con «reducir movimiento» dibuja una sola red estática.
 */
export function ParticulasHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const lienzo: HTMLCanvasElement = canvas
    const contexto = lienzo.getContext('2d')
    if (!contexto) return
    const ctx: CanvasRenderingContext2D = contexto

    const seccion = lienzo.closest('section')
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tactil = window.matchMedia('(pointer: coarse)').matches
    const ligero = tactil || (navigator.hardwareConcurrency || 8) <= 4
    const cantidad = ligero ? 24 : 52
    const distanciaMaxima = ligero ? 92 : 122

    let ancho = 1
    let alto = 1
    let dpr = 1
    let particulas: Particula[] = []
    let frame = 0
    let visible = true
    let pausado = document.hidden
    let puntero = { x: 0, y: 0, activo: false }

    function crearParticulas(): Particula[] {
      return Array.from({ length: cantidad }, () => ({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 0.6,
      }))
    }

    function medir() {
      const rect = lienzo.getBoundingClientRect()
      ancho = Math.max(1, rect.width)
      alto = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      lienzo.width = Math.round(ancho * dpr)
      lienzo.height = Math.round(alto * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function dibujar(actualizar: boolean) {
      ctx.clearRect(0, 0, ancho, alto)

      for (const particula of particulas) {
        if (actualizar) {
          if (puntero.activo && !ligero) {
            const dx = particula.x - puntero.x
            const dy = particula.y - puntero.y
            const distancia = Math.hypot(dx, dy)
            if (distancia < 170 && distancia > 1) {
              const fuerza = (1 - distancia / 170) * 0.012
              particula.vx += dx * fuerza
              particula.vy += dy * fuerza
            }
          }

          particula.x += particula.vx
          particula.y += particula.vy
          particula.vx *= 0.994
          particula.vy *= 0.994

          const velocidad = Math.hypot(particula.vx, particula.vy)
          if (velocidad > 0.55) {
            particula.vx = (particula.vx / velocidad) * 0.55
            particula.vy = (particula.vy / velocidad) * 0.55
          }

          if (particula.x < -12) particula.x = ancho + 12
          if (particula.x > ancho + 12) particula.x = -12
          if (particula.y < -12) particula.y = alto + 12
          if (particula.y > alto + 12) particula.y = -12
        }
      }

      ctx.lineWidth = 1
      for (let i = 0; i < particulas.length; i += 1) {
        const a = particulas[i]
        for (let j = i + 1; j < particulas.length; j += 1) {
          const b = particulas[j]
          const distancia = Math.hypot(a.x - b.x, a.y - b.y)
          if (distancia < distanciaMaxima) {
            ctx.strokeStyle = `rgba(0, 90, 180, ${(1 - distancia / distanciaMaxima) * 0.17})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        if (puntero.activo && !ligero) {
          const distancia = Math.hypot(a.x - puntero.x, a.y - puntero.y)
          if (distancia < 175) {
            ctx.strokeStyle = `rgba(33, 192, 99, ${(1 - distancia / 175) * 0.22})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(puntero.x, puntero.y)
            ctx.stroke()
          }
        }
      }

      for (const particula of particulas) {
        ctx.fillStyle = 'rgba(0, 123, 255, 0.36)'
        ctx.beginPath()
        ctx.arc(particula.x, particula.y, particula.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function animar() {
      frame = 0
      if (!visible || pausado) return
      dibujar(true)
      frame = window.requestAnimationFrame(animar)
    }

    function iniciar() {
      if (reducido || frame || !visible || pausado) return
      frame = window.requestAnimationFrame(animar)
    }

    function detener() {
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    function alMover(evento: PointerEvent) {
      if (ligero || evento.pointerType === 'touch') {
        puntero.activo = false
        return
      }
      const rect = lienzo.getBoundingClientRect()
      puntero = {
        x: evento.clientX - rect.left,
        y: evento.clientY - rect.top,
        activo: true,
      }
    }

    function alSalir() {
      puntero.activo = false
    }

    function alCambiarVisibilidad() {
      pausado = document.hidden
      if (pausado) detener()
      else iniciar()
    }

    function alRedimensionar() {
      medir()
      if (reducido) dibujar(false)
    }

    medir()
    particulas = crearParticulas()
    dibujar(false)
    iniciar()

    const observador =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([entrada]) => {
              visible = entrada.isIntersecting
              if (visible) iniciar()
              else detener()
            },
            { threshold: 0 },
          )
        : null
    observador?.observe(lienzo)

    const redimensionador =
      'ResizeObserver' in window ? new ResizeObserver(alRedimensionar) : null
    if (redimensionador) redimensionador.observe(lienzo)
    else window.addEventListener('resize', alRedimensionar)

    seccion?.addEventListener('pointermove', alMover, { passive: true })
    seccion?.addEventListener('pointerleave', alSalir)
    document.addEventListener('visibilitychange', alCambiarVisibilidad)

    return () => {
      detener()
      observador?.disconnect()
      redimensionador?.disconnect()
      if (!redimensionador) window.removeEventListener('resize', alRedimensionar)
      seccion?.removeEventListener('pointermove', alMover)
      seccion?.removeEventListener('pointerleave', alSalir)
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
}
