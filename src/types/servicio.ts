import type { PlanSolicitud } from './solicitud'

export interface Servicio {
  id: string
  cliente_id: string
  titulo: string
  tipo: string
  estado: string
  monto: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  notas: string | null
  created_at: string
  solicitud_id?: string | null
  descripcion?: string | null
  entregables?: string | null
  informe?: string | null
  plan_ia?: PlanSolicitud | null
  progreso?: number
  ejecutado_por_ia?: boolean
  /** Presente cuando la consulta incluye el join: select('*, clientes(nombre)') */
  clientes?: { nombre: string } | null
}
