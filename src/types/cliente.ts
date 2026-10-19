export interface Cliente {
  id: string
  nombre: string
  empresa: string | null
  email: string | null
  telefono: string | null
  estado: string
  notas: string | null
  created_at: string
}
