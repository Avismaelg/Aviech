export interface Pago {
  id: string
  cliente_id: string
  concepto: string
  monto: number
  fecha: string
  estado: string
  metodo: string | null
  created_at: string
  /** Presente cuando la consulta incluye el join: select('*, clientes(nombre)') */
  clientes?: { nombre: string } | null
}
