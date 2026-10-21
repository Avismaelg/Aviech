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

/** URL pública del portal de talento. */
export function urlPortalTalento(): string {
  return `${window.location.origin}/talento`
}
