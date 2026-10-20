import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * En desarrollo el panel corre en Vite (otro puerto) y la API vive en el Worker
 * publicado; en producción todo es el mismo dominio (sin CORS).
 */
const BASE_API = import.meta.env.DEV ? 'https://aviech.avismael-eg.workers.dev' : ''

export interface MensajeIA {
  rol: 'user' | 'assistant'
  contenido: string
}

/**
 * Envía la conversación al Worker. La IA corre con la asignación gratuita de
 * Cloudflare Workers AI: no hay claves ni costos por mensaje.
 */
export async function conversarConIA(mensajes: MensajeIA[], token: string): Promise<string> {
  const respuesta = await fetch(`${BASE_API}/api/ia/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mensajes }),
  })
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new Error(datos?.error || 'El asistente no pudo responder. Inténtalo de nuevo.')
  }
  if (!datos?.respuesta) {
    throw new Error('El asistente no devolvió una respuesta. Inténtalo de nuevo.')
  }
  return datos.respuesta as string
}

/** Token fresco de Supabase (refresca la sesión si hace falta). */
export async function obtenerToken(supabase: SupabaseClient | null): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
  return token
}
