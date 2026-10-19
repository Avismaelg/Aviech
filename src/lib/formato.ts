const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const formatoFechaLarga = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

/** $1,234.50 — o "—" cuando no hay monto. */
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
