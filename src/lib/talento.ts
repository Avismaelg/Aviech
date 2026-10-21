import type { ResultadoPostulacionIA } from '../types/talento'
import { supabase } from './supabase'

export const LIMITE_CV_BYTES = 5 * 1024 * 1024
export const NOMBRE_BUCKET_CV = 'talento-cv'

/** Texto separado por comas → arreglo limpio de habilidades. */
export function habilidadesDesdeTexto(texto: string): string[] {
  return texto
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .slice(0, 20)
}

/** Arreglo de habilidades → texto editable. */
export function textoDesdeHabilidades(habilidades: string[] | null | undefined): string {
  return (habilidades ?? []).join(', ')
}

/** Sube un CV PDF al bucket privado, bajo la carpeta pública de subida. */
export async function subirCV(
  archivo: File,
): Promise<{ path: string; nombre: string } | { error: string }> {
  if (!supabase) return { error: 'El portal no está conectado con Supabase.' }
  if (archivo.type !== 'application/pdf') return { error: 'El CV debe ser un archivo PDF.' }
  if (archivo.size > LIMITE_CV_BYTES) return { error: 'El CV no puede superar 5 MB.' }

  const identificador =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const path = `publico/${identificador}.pdf`
  const { error } = await supabase.storage.from(NOMBRE_BUCKET_CV).upload(path, archivo, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (error) {
    return { error: 'No se pudo subir el CV. Revisa que sea un PDF de menos de 5 MB e inténtalo otra vez.' }
  }
  return { path, nombre: archivo.name.slice(0, 180) }
}

/** Crea un enlace temporal para que el personal abra un CV privado. */
export async function urlFirmadaCV(path: string | null | undefined): Promise<string | null> {
  if (!supabase || !path) return null
  const { data, error } = await supabase.storage.from(NOMBRE_BUCKET_CV).createSignedUrl(path, 3600)
  return error ? null : data.signedUrl
}

/** Abre el CV del candidato (archivo privado o enlace externo). */
export async function abrirCV(
  cvPath: string | null | undefined,
  cvUrl: string | null | undefined,
): Promise<{ ok: true } | { error: string }> {
  if (cvPath) {
    const url = await urlFirmadaCV(cvPath)
    if (!url) return { error: 'No se pudo abrir el CV. Vuelve a intentarlo.' }
    window.open(url, '_blank', 'noopener,noreferrer')
    return { ok: true }
  }
  if (cvUrl) {
    if (!/^https?:\/\//i.test(cvUrl)) return { error: 'El enlace del CV no es válido.' }
    window.open(cvUrl, '_blank', 'noopener,noreferrer')
    return { ok: true }
  }
  return { error: 'Este candidato todavía no tiene CV.' }
}

/** Token de la sesión actual, para las rutas internas del Worker. */
export async function tokenSesion(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

// El portal guarda el token privado del perfil en el navegador de quien lo
// crea. Sirve para dos cosas: actualizar su propio perfil sin que nadie más
// pueda hacerlo desde otro dispositivo, y pedir la postulación con IA.
const PREFIJO_TOKEN_TALENTO = 'avitech:talento:perfil:'

function claveTokenPerfil(email: string): string {
  return `${PREFIJO_TOKEN_TALENTO}${email.trim().toLowerCase()}`
}

/** Token guardado en este navegador para ese correo, si existe. */
export function tokenPerfilGuardado(email: string): string | null {
  if (!email.trim()) return null
  try {
    return window.localStorage.getItem(claveTokenPerfil(email))
  } catch {
    return null
  }
}

/** Guarda el token del perfil en este navegador para futuras actualizaciones. */
export function guardarTokenPerfil(email: string, token: string | null | undefined): void {
  if (!email.trim() || !token) return
  try {
    window.localStorage.setItem(claveTokenPerfil(email), token)
  } catch {
    // Si el navegador bloquea el almacenamiento, el perfil igual quedó creado.
  }
}

/** CV guardados en el bucket que ya no pertenecen a ningún candidato. */
export async function listarCVHuerfanos(
  referenciados: Array<string | null | undefined>,
): Promise<{ rutas: string[]; truncado: boolean } | { error: string }> {
  if (!supabase) return { error: 'El panel no está conectado con Supabase.' }
  const { data, error } = await supabase.storage
    .from(NOMBRE_BUCKET_CV)
    .list('publico', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
  if (error) return { error: 'No se pudo revisar la carpeta de CV. Inténtalo otra vez.' }

  const usados = new Set(referenciados.filter((ruta): ruta is string => Boolean(ruta)))
  const archivos = (Array.isArray(data) ? data : []).filter(
    (item) => item && typeof item.name === 'string' && item.name.toLowerCase().endsWith('.pdf'),
  )
  const rutas = archivos
    .map((item) => `publico/${item.name}`)
    .filter((ruta) => !usados.has(ruta))
  return { rutas, truncado: archivos.length >= 1000 }
}

/** Borra CV del bucket privado (solo personal con sesión). */
export async function borrarCVs(rutas: string[]): Promise<{ borrados: number } | { error: string }> {
  if (!supabase) return { error: 'El panel no está conectado con Supabase.' }
  if (rutas.length === 0) return { borrados: 0 }
  const { error } = await supabase.storage.from(NOMBRE_BUCKET_CV).remove(rutas)
  if (error) return { error: 'No se pudieron borrar los CV. Inténtalo otra vez.' }
  return { borrados: rutas.length }
}

/** "RD$25,000 – RD$35,000" o "Salario a convenir". */
export function rangoSalario(
  minimo: number | null | undefined,
  maximo: number | null | undefined,
): string {
  const formato = new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0,
  })
  if (minimo != null && maximo != null) return `${formato.format(minimo)} – ${formato.format(maximo)}`
  if (minimo != null) return `Desde ${formato.format(minimo)}`
  if (maximo != null) return `Hasta ${formato.format(maximo)}`
  return 'Salario a convenir'
}

/** Valor ISO → valor para <input type="datetime-local">, en hora local. */
export function paraInputFechaHora(valor: string | null | undefined): string {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  const dos = (numero: number) => String(numero).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(
    fecha.getMinutes(),
  )}`
}

/** Valor de <input type="datetime-local"> → ISO, o null si está vacío. */
export function desdeInputFechaHora(valor: string): string | null {
  if (!valor) return null
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString()
}

/** Fecha y hora cortas en español dominicano. */
export function formatoFechaHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

/**
 * Pide a la IA que revise las vacantes abiertas y postule el perfil del
 * candidato. La autorización viaja con el token privado que devolvió el alta
 * del perfil; el Worker nunca recibe el correo ni el CV.
 */
export async function postularConIA(
  candidatoId: string,
  tokenPublico: string,
): Promise<ResultadoPostulacionIA> {
  const respuesta = await fetch('/api/talento/ia-postular', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidato_id: candidatoId, token_publico: tokenPublico }),
  })
  const datos = (await respuesta.json().catch(() => null)) as
    | (ResultadoPostulacionIA & { error?: string })
    | null
  if (!respuesta.ok || !datos?.ok) {
    throw new Error(datos?.error || 'La IA no pudo revisar las vacantes. Inténtalo otra vez.')
  }
  return datos
}

/** URL pública del portal de talento. */
export function urlPortalTalento(): string {
  return `${window.location.origin}/talento`
}
