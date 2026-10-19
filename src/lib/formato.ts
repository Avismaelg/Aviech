// Formatos para República Dominicana (Santo Domingo): pesos RD$ y fechas es-DO.
const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' })
const formatoFechaLarga = new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })

/** RD$1,234.56 — o "—" cuando no hay monto. */
export function formatoDinero(monto: number | null | undefined): string {
  return monto == null ? '—' : formatoMoneda.format(monto)
}

/** "18 oct 2026" — acepta tanto "2026-10-18" como marca de tiempo completa. */
export function formatoFecha(valor: string | null | undefined): string {
  if (!valor) return '—'
  const fecha = new Date(valor.length <= 10 ? `${valor}T12:00:00` : valor)
  return Number.isNaN(fecha.getTime()) ? '—' : formatoFechaLarga.format(fecha)
}

/** Fecha de hoy en formato YYYY-MM-DD (para campos de tipo fecha). */
export function hoyISO(): string {
  const fecha = new Date()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

/** Mes actual en formato YYYY-MM. */
export function mesActualISO(): string {
  return hoyISO().slice(0, 7)
}

/** Iniciales para avatares: "Grupo del Norte" → "GD". */
export function iniciales(nombre: string): string {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

/** Días transcurridos desde una fecha "YYYY-MM-DD" (positivo = ya pasó). */
export function diasDeAtraso(fecha: string | null | undefined): number {
  if (!fecha) return 0
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
  if (!anio || !mes || !dia) return 0
  const objetivo = new Date(anio, mes - 1, dia)
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  return Math.round((hoy.getTime() - objetivo.getTime()) / 86400000)
}

const formatoMesLargo = new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' })
const formatoFechaCompleta = new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })

/** "Octubre de 2026" a partir de "2026-10". */
export function formatoMes(clave: string): string {
  const [anio, mes] = clave.split('-').map(Number)
  if (!anio || !mes) return clave
  const texto = formatoMesLargo.format(new Date(anio, mes - 1, 1))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** "18 de octubre de 2026" — si no se pasa valor, usa hoy. */
export function fechaCompleta(valor?: string | null): string {
  const fecha = valor ? new Date(valor.length <= 10 ? `${valor}T12:00:00` : valor) : new Date()
  return Number.isNaN(fecha.getTime()) ? '—' : formatoFechaCompleta.format(fecha)
}
