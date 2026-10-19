export interface FacturaItem {
  id?: string
  factura_id?: string
  descripcion: string
  cantidad: number
  precio: number
}

export interface Factura {
  id: string
  cliente_id: string | null
  cliente_nombre: string
  cliente_rnc: string | null
  numero: string | null
  tipo: string
  fecha: string
  aplica_itbis: boolean
  subtotal: number
  itbis: number
  total: number
  estado: string
  notas: string | null
  pago_id: string | null
  created_at: string
  /** Presente cuando la consulta incluye el join: select('*, factura_items(*)') */
  factura_items?: FacturaItem[]
}
