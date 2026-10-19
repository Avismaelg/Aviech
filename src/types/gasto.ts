export interface Gasto {
  id: string
  concepto: string
  categoria: string
  monto: number
  fecha: string
  notas: string | null
  created_at: string
}
