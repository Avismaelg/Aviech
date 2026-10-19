export interface Iguala {
  id: string
  cliente_id: string
  categoria: string
  descripcion: string
  monto_mensual: number
  dia_cobro: number
  fecha_inicio: string
  estado: string
  notas: string | null
  created_at: string
  /** Presente cuando la consulta incluye el join: select('*, clientes(nombre)') */
  clientes?: { nombre: string } | null
}
