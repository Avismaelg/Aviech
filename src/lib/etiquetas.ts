export type ColorInsignia = 'emerald' | 'amber' | 'sky' | 'red' | 'slate' | 'indigo'

// ---------- Clientes ----------
export const ESTADOS_CLIENTE = ['activo', 'prospecto', 'pausado'] as const

export const etiquetaEstadoCliente: Record<string, string> = {
  activo: 'Activo',
  prospecto: 'Prospecto',
  pausado: 'Pausado',
}

export const colorEstadoCliente: Record<string, ColorInsignia> = {
  activo: 'emerald',
  prospecto: 'sky',
  pausado: 'amber',
}

// ---------- Servicios ----------
export const TIPOS_SERVICIO = ['auditoria', 'consultoria', 'implementacion', 'capacitacion', 'otro'] as const

export const etiquetaTipoServicio: Record<string, string> = {
  auditoria: 'Auditoría',
  consultoria: 'Consultoría',
  implementacion: 'Implementación',
  capacitacion: 'Capacitación',
  otro: 'Otro',
}

export const ESTADOS_SERVICIO = ['pendiente', 'en_curso', 'completado', 'cancelado'] as const

export const etiquetaEstadoServicio: Record<string, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export const colorEstadoServicio: Record<string, ColorInsignia> = {
  pendiente: 'amber',
  en_curso: 'sky',
  completado: 'emerald',
  cancelado: 'slate',
}

// ---------- Pagos ----------
export const ESTADOS_PAGO = ['pendiente', 'pagado'] as const

export const etiquetaEstadoPago: Record<string, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
}

export const colorEstadoPago: Record<string, ColorInsignia> = {
  pendiente: 'amber',
  pagado: 'emerald',
}

export const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta', 'otro'] as const

export const etiquetaMetodoPago: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}

/** Traduce un valor interno a texto bonito; si no hay mapa, muestra el valor tal cual. */
export function etiqueta(mapa: Record<string, string>, valor: string | null | undefined, alterno = '—'): string {
  return valor ? (mapa[valor] ?? valor) : alterno
}
