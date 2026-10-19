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
  /** Presente cuando la consulta incluye el join: select('*, clientes(nombre)') */
  clientes?: { nombre: string } | null
}
