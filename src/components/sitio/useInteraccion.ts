import { useEffect, useRef } from 'react'

function equipoLigero() {
  const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return (navigator.hardwareConcurrency || 8) <= 4 || (typeof memoria === 'number' && memoria <= 4)
}

/**
 * Inclinación 3D sutil para tarjetas. Escribe `--rx`, `--ry`, `--mx` y `--my`
 * en el elemento; el CSS se encarga del resto.
 *
 * No se activa con movimiento reducido, puntero táctil ni equipos de pocos
 * recursos. Los listeners y el frame se limpian al desmontar.
 */
export function useTilt(maximo = 6) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return
    const elemento: HTMLElement = nodo
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (equipoLigero()) return

    let frame = 0
    let objetivoX = 0
    let objetivoY = 0
    let actualX = 0
    let actualY = 0

    function animar() {
      frame = 0
      actualX += (objetivoX - actualX) * 0.18
      actualY += (objetivoY - actualY) * 0.18
      elemento.style.setProperty('--rx', `${actualX.toFixed(2)}deg`)
      elemento.style.setProperty('--ry', `${actualY.toFixed(2)}deg`)
      if (Math.abs(objetivoX - actualX) > 0.05 || Math.abs(objetivoY - actualY) > 0.05) {
        frame = window.requestAnimationFrame(animar)
      }
    }

    function alMover(evento: PointerEvent) {
      if (evento.pointerType === 'touch') return
      const rect = elemento.getBoundingClientRect()
      const x = (evento.clientX - rect.left) / rect.width
      const y = (evento.clientY - rect.top) / rect.height
      objetivoX = (y - 0.5) * -2 * maximo
      objetivoY = (x - 0.5) * 2 * maximo
      elemento.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      elemento.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      if (!frame) frame = window.requestAnimationFrame(animar)
    }

    function alSalir() {
      objetivoX = 0
      objetivoY = 0
      if (!frame) frame = window.requestAnimationFrame(animar)
    }

    elemento.addEventListener('pointermove', alMover, { passive: true })
    elemento.addEventListener('pointerleave', alSalir)
    elemento.addEventListener('focusout', alSalir)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      elemento.removeEventListener('pointermove', alMover)
      elemento.removeEventListener('pointerleave', alSalir)
      elemento.removeEventListener('focusout', alSalir)
      elemento.style.removeProperty('--rx')
      elemento.style.removeProperty('--ry')
      elemento.style.removeProperty('--mx')
      elemento.style.removeProperty('--my')
    }
  }, [maximo])

  return ref
}
