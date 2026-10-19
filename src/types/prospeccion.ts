// Tipos de la Prospección (scraper de contactos). Los devuelve el Worker en
// GET /api/scraper/contactos.

export interface PaginaVisitada {
  url: string
  estado: number
  titulo: string
}

/** Dato encontrado (correo o teléfono) y en qué página apareció. */
export interface Hallazgo {
  valor: string
  origen: string
}

/** Red social encontrada en el sitio. */
export interface HallazgoRed {
  red: string
  url: string
  origen: string
}

export interface DatosProspeccion {
  url: string
  urlFinal: string
  dominio: string
  nombre: string
  paginas: PaginaVisitada[]
  emails: Hallazgo[]
  telefonos: Hallazgo[]
  redes: HallazgoRed[]
  tiempoMs: number
  fecha: string
}
