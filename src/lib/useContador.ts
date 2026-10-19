import { useEffect, useRef, useState } from 'react'

/**
 * Anima un número desde el valor anterior (o 0) hasta el nuevo, con suavizado.
 * Respeta "reducir movimiento" del sistema: en ese caso salta directo.
 */
export function useContador(valor: number, duracion = 800): number {
  const [mostrado, setMostrado] = useState(0)
  const anterior = useRef(0)

  useEffect(() => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const inmediato = reducir || duracion <= 0
    const desde = inmediato ? valor : anterior.current
    const inicio = performance.now()
    let marco = 0
    const paso = (ahora: number) => {
      const avance = inmediato ? 1 : Math.min((ahora - inicio) / duracion, 1)
      const suave = 1 - Math.pow(1 - avance, 3)
      setMostrado(desde + (valor - desde) * suave)
      if (avance < 1) {
        marco = requestAnimationFrame(paso)
      } else {
        anterior.current = valor
      }
    }
    marco = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(marco)
  }, [valor, duracion])

  return mostrado
}
