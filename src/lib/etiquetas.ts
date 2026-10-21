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
export const TIPOS_SERVICIO = ['auditoria', 'consultoria', 'implementacion', 'capacitacion', 'seo', 'contabilidad', 'otro'] as const

export const etiquetaTipoServicio: Record<string, string> = {
  auditoria: 'Auditoría',
  consultoria: 'Consultoría',
  implementacion: 'Implementación',
  capacitacion: 'Capacitación',
  seo: 'Auditoría SEO',
  contabilidad: 'Contabilidad',
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

// ---------- Solicitudes de servicio ----------
export const ESTADOS_SOLICITUD = ['nueva', 'analizando', 'completada', 'error', 'rechazada'] as const

export const etiquetaEstadoSolicitud: Record<string, string> = {
  nueva: 'Nueva',
  analizando: 'IA trabajando',
  completada: 'Completada',
  error: 'Para reintentar',
  rechazada: 'Rechazada',
}

export const colorEstadoSolicitud: Record<string, ColorInsignia> = {
  nueva: 'sky',
  analizando: 'blue',
  completada: 'emerald',
  error: 'red',
  rechazada: 'slate',
}

export const URGENCIAS_SOLICITUD = ['baja', 'media', 'alta'] as const

export const etiquetaUrgenciaSolicitud: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}

export const colorUrgenciaSolicitud: Record<string, ColorInsignia> = {
  baja: 'slate',
  media: 'amber',
  alta: 'red',
}

export const CANALES_SOLICITUD = ['formulario', 'whatsapp', 'correo', 'llamada', 'presencial', 'otro'] as const

export const etiquetaCanalSolicitud: Record<string, string> = {
  formulario: 'Formulario',
  whatsapp: 'WhatsApp',
  correo: 'Correo',
  llamada: 'Llamada',
  presencial: 'Presencial',
  otro: 'Otro',
}

export const etiquetaOrigenSolicitud: Record<string, string> = {
  interno: 'Interna',
  publico: 'Formulario público',
}

// ---------- Talento ----------
export const ETAPAS_TALENTO = ['recibida', 'preseleccion', 'entrevista', 'oferta', 'contratada', 'rechazada'] as const

export const ETAPAS_TALENTO_ABIERTAS = ['recibida', 'preseleccion', 'entrevista', 'oferta'] as const

export const etiquetaEtapaTalento: Record<string, string> = {
  recibida: 'Recibida',
  preseleccion: 'Preselección',
  entrevista: 'Entrevista',
  oferta: 'Oferta',
  contratada: 'Contratada',
  rechazada: 'Rechazada',
}

export const colorEtapaTalento: Record<string, ColorInsignia> = {
  recibida: 'slate',
  preseleccion: 'sky',
  entrevista: 'blue',
  oferta: 'amber',
  contratada: 'emerald',
  rechazada: 'red',
}

export const ESTADOS_CANDIDATO = ['nuevo', 'evaluando', 'entrevista', 'oferta', 'contratado', 'descartado'] as const

export const etiquetaEstadoCandidato: Record<string, string> = {
  nuevo: 'Nuevo',
  evaluando: 'Evaluando',
  entrevista: 'En entrevista',
  oferta: 'Con oferta',
  contratado: 'Contratado',
  descartado: 'Descartado',
}

export const colorEstadoCandidato: Record<string, ColorInsignia> = {
  nuevo: 'sky',
  evaluando: 'blue',
  entrevista: 'cyan',
  oferta: 'amber',
  contratado: 'emerald',
  descartado: 'slate',
}

export const ESTADOS_EMPRESA_TALENTO = ['prospecto', 'activa', 'pausada', 'cerrada'] as const

export const etiquetaEstadoEmpresaTalento: Record<string, string> = {
  prospecto: 'Prospecto',
  activa: 'Activa',
  pausada: 'Pausada',
  cerrada: 'Cerrada',
}

export const colorEstadoEmpresaTalento: Record<string, ColorInsignia> = {
  prospecto: 'sky',
  activa: 'emerald',
  pausada: 'amber',
  cerrada: 'slate',
}

export const ESTADOS_VACANTE = ['borrador', 'abierta', 'pausada', 'cerrada'] as const

export const etiquetaEstadoVacante: Record<string, string> = {
  borrador: 'Borrador',
  abierta: 'Abierta',
  pausada: 'Pausada',
  cerrada: 'Cerrada',
}

export const colorEstadoVacante: Record<string, ColorInsignia> = {
  borrador: 'slate',
  abierta: 'emerald',
  pausada: 'amber',
  cerrada: 'red',
}

export const SENIORITIES = ['junior', 'mid', 'senior', 'lead', 'director'] as const

export const etiquetaSeniority: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
  director: 'Director',
}

export const MODALIDADES_TALENTO = ['presencial', 'hibrido', 'remoto', 'flexible'] as const

export const etiquetaModalidad: Record<string, string> = {
  presencial: 'Presencial',
  hibrido: 'Híbrido',
  remoto: 'Remoto',
  flexible: 'Flexible',
}

export const TIPOS_CONTRATO = ['tiempo_completo', 'medio_tiempo', 'contrato', 'temporal', 'practica'] as const

export const etiquetaTipoContrato: Record<string, string> = {
  tiempo_completo: 'Tiempo completo',
  medio_tiempo: 'Medio tiempo',
  contrato: 'Por contrato',
  temporal: 'Temporal',
  practica: 'Práctica',
}

export const ORIGENES_TALENTO = ['publico', 'empresa', 'interno', 'ia', 'referido'] as const

export const etiquetaOrigenTalento: Record<string, string> = {
  publico: 'Portal · candidato',
  empresa: 'Portal · empresa',
  interno: 'Interno',
  ia: 'Matching IA',
  referido: 'Referido',
}

export const colorOrigenTalento: Record<string, ColorInsignia> = {
  publico: 'sky',
  empresa: 'blue',
  interno: 'slate',
  ia: 'amber',
  referido: 'emerald',
}

export const TIPOS_ENTREVISTA = ['telefonica', 'virtual', 'presencial', 'tecnica'] as const

export const etiquetaTipoEntrevista: Record<string, string> = {
  telefonica: 'Telefónica',
  virtual: 'Virtual',
  presencial: 'Presencial',
  tecnica: 'Técnica',
}

export const etiquetaSolicitudTalento: Record<string, string> = {
  entrevista: 'Solicitud de entrevista',
  contratacion: 'Solicitud de contratación',
}

export const DISPONIBILIDADES = ['inmediata', '2_semanas', '1_mes', 'flexible'] as const

export const etiquetaDisponibilidad: Record<string, string> = {
  inmediata: 'Inmediata',
  '2_semanas': 'En 2 semanas',
  '1_mes': 'En 1 mes',
  flexible: 'Flexible',
}
