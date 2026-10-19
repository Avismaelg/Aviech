import type { ColorInsignia } from './etiquetas'
import type { DatosSeo, VelocidadSeo } from '../types/seo'

/**
 * En desarrollo el panel corre en Vite (otro puerto) y la API vive en el Worker
 * publicado; en producción todo es el mismo dominio (sin CORS).
 */
const BASE_API = import.meta.env.DEV ? 'https://aviech.avismael-eg.workers.dev' : ''

/** Llama al Worker del panel (mismo dominio en producción) con la sesión del usuario. */
export async function auditarSitio(url: string, token: string): Promise<DatosSeo> {
  const respuesta = await fetch(`${BASE_API}/api/seo/auditar?url=${encodeURIComponent(url)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new Error(datos?.error || 'No se pudo completar la auditoría. Inténtalo de nuevo.')
  }
  return datos as DatosSeo
}

/** PageSpeed Insights (gratis, sin clave). Se llama desde el navegador, que sí puede por CORS. */
export async function medirVelocidad(url: string): Promise<VelocidadSeo> {
  const parametros = new URLSearchParams()
  parametros.append('url', url)
  parametros.append('strategy', 'mobile')
  for (const categoria of ['performance', 'seo', 'accessibility', 'best-practices']) {
    parametros.append('category', categoria)
  }
  const respuesta = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${parametros.toString()}`)
  if (!respuesta.ok) {
    throw new Error(
      respuesta.status === 429
        ? 'PageSpeed está limitado en este momento. Espera unos minutos y vuelve a intentarlo.'
        : 'No se pudo medir la velocidad con PageSpeed. Inténtalo más tarde.',
    )
  }
  const datos = await respuesta.json()
  const categorias = datos?.lighthouseResult?.categories ?? {}
  const auditorias = datos?.lighthouseResult?.audits ?? {}
  const puntaje = (categoria?: { score?: number | null }) => Math.round((categoria?.score ?? 0) * 100)
  return {
    performance: puntaje(categorias.performance),
    seo: puntaje(categorias.seo),
    accesibilidad: puntaje(categorias.accessibility),
    buenasPracticas: puntaje(categorias['best-practices']),
    lcp: auditorias['largest-contentful-paint']?.displayValue ?? null,
    cls: auditorias['cumulative-layout-shift']?.displayValue ?? null,
    estrategia: 'mobile',
    fecha: new Date().toISOString(),
  }
}

export function colorPuntaje(puntaje: number): ColorInsignia {
  if (puntaje >= 80) return 'emerald'
  if (puntaje >= 50) return 'amber'
  return 'red'
}

export function etiquetaPuntaje(puntaje: number): string {
  if (puntaje >= 80) return 'Buen estado'
  if (puntaje >= 50) return 'Mejorable'
  return 'Necesita atención'
}
