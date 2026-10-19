export type ColorInsignia = 'emerald' | 'amber' | 'sky' | 'red' | 'slate' | 'blue' | 'cyan'

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

// ---------- Gastos ----------
export const CATEGORIAS_GASTO = ['operativo', 'herramientas', 'marketing', 'impuestos', 'personal', 'otro'] as const

export const etiquetaCategoriaGasto: Record<string, string> = {
  operativo: 'Operativo',
  herramientas: 'Herramientas',
  marketing: 'Marketing',
  impuestos: 'Impuestos',
  personal: 'Personal',
  otro: 'Otro',
}

export const colorCategoriaGasto: Record<string, ColorInsignia> = {
  operativo: 'slate',
  herramientas: 'sky',
  marketing: 'blue',
  impuestos: 'amber',
  personal: 'emerald',
  otro: 'slate',
}

// ---------- Facturas ----------
export const TIPOS_FACTURA = ['B01', 'B02', 'B14', 'B15', 'E31', 'E32', 'E44', 'E45'] as const

export const etiquetaTipoFactura: Record<string, string> = {
  B01: 'Crédito fiscal',
  B02: 'Consumo',
  B14: 'Regímenes especiales',
  B15: 'Gubernamental',
  E31: 'Crédito fiscal · e-CF',
  E32: 'Consumo · e-CF',
  E44: 'Regímenes especiales · e-CF',
  E45: 'Gubernamental · e-CF',
}

export const ESTADOS_FACTURA = ['borrador', 'emitida', 'pagada', 'anulada'] as const

export const etiquetaEstadoFactura: Record<string, string> = {
  borrador: 'Borrador',
  emitida: 'Emitida',
  pagada: 'Pagada',
  anulada: 'Anulada',
}

export const colorEstadoFactura: Record<string, ColorInsignia> = {
  borrador: 'slate',
  emitida: 'blue',
  pagada: 'emerald',
  anulada: 'red',
}

// ---------- Igualas (contratos mensuales) ----------
export const CATEGORIAS_IGUALA = ['contabilidad', 'software', 'asesoria_legal'] as const

export const etiquetaCategoriaIguala: Record<string, string> = {
  contabilidad: 'Contabilidad',
  software: 'Software',
  asesoria_legal: 'Asesoría legal',
}

export const colorCategoriaIguala: Record<string, ColorInsignia> = {
  contabilidad: 'emerald',
  software: 'sky',
  asesoria_legal: 'blue',
}

export const ESTADOS_IGUALA = ['activa', 'pausada', 'cancelada'] as const

export const etiquetaEstadoIguala: Record<string, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

export const colorEstadoIguala: Record<string, ColorInsignia> = {
  activa: 'emerald',
  pausada: 'amber',
  cancelada: 'slate',
}

// ---------- CRM ----------
export const ETAPAS_CRM = ['prospecto', 'contactado', 'reunion', 'propuesta', 'negociacion', 'ganado', 'perdido'] as const

/** Etapas que cuentan como pipeline abierto (aún no ganado ni perdido). */
export const ETAPAS_CRM_ABIERTAS = ['prospecto', 'contactado', 'reunion', 'propuesta', 'negociacion'] as const

export const etiquetaEtapaCrm: Record<string, string> = {
  prospecto: 'Prospecto',
  contactado: 'Contactado',
  reunion: 'Reunión',
  propuesta: 'Propuesta',
  negociacion: 'Negociación',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

export const colorEtapaCrm: Record<string, ColorInsignia> = {
  prospecto: 'slate',
  contactado: 'sky',
  reunion: 'blue',
  propuesta: 'amber',
  negociacion: 'cyan',
  ganado: 'emerald',
  perdido: 'red',
}

export const TIPOS_ACTIVIDAD_CRM = ['llamada', 'correo', 'reunion', 'tarea', 'nota'] as const

export const etiquetaTipoActividadCrm: Record<string, string> = {
  llamada: 'Llamada',
  correo: 'Correo',
  reunion: 'Reunión',
  tarea: 'Tarea',
  nota: 'Nota',
}

export const colorTipoActividadCrm: Record<string, ColorInsignia> = {
  llamada: 'sky',
  correo: 'blue',
  reunion: 'cyan',
  tarea: 'amber',
  nota: 'slate',
}
