export interface PlanSolicitud {
  resumen: string
  alcance: string
  entregables: string[]
  tareas: string[]
  cronograma: string[]
  precio_sugerido: number
  propuesta: string
  correo: string
  informe: string
  nivel_confianza: 'alto' | 'medio' | 'bajo' | string
  datos_pendientes: string[]
}

export interface SolicitudServicio {
  id: string
  token_publico?: string
  origen: 'interno' | 'publico' | string
  canal: string
  cliente_id: string | null
  solicitante_nombre: string
  empresa: string | null
  email: string | null
  telefono: string | null
  sitio_web: string | null
  tipo: string
  titulo: string
  descripcion: string
  objetivos: string | null
  presupuesto: number | null
  urgencia: string
  fecha_deseada: string | null
  estado: string
  plan_ia: PlanSolicitud | null
  informe_ia: string | null
  propuesta_ia: string | null
  correo_ia: string | null
  precio_sugerido: number | null
  servicio_id: string | null
  oportunidad_id: string | null
  empresa_id: string | null
  contacto_id: string | null
  cliente_creado: boolean
  error_ia: string | null
  ejecutado_en: string | null
  created_at: string
  updated_at: string
}
