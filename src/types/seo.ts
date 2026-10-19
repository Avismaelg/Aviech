export type EstadoChequeo = 'bien' | 'mejorable' | 'mal'
export type GrupoChequeo = 'contenido' | 'tecnico' | 'archivos'

export interface ChequeoSeo {
  id: string
  grupo: GrupoChequeo
  titulo: string
  estado: EstadoChequeo
  detalle: string
}

export interface ContenidoSeo {
  titulo: string
  tituloLargo: number
  metaDescripcion: string
  metaDescripcionLargo: number
  h1: string[]
  h1Cantidad: number
  h2Cantidad: number
  palabras: number
  imagenesTotal: number
  imagenesSinAlt: number
  imagenesAltVacio: number
  enlacesInternos: number
  enlacesExternos: number
  enlacesNofollow: number
  datosEstructurados: number
}

export interface TecnicoSeo {
  lang: string
  viewport: string
  viewportPresente: boolean
  canonical: string
  metaRobots: string
  noindex: boolean
  ogTitulo: boolean
  ogDescripcion: boolean
  ogImagen: boolean
  hreflang: number
}

export interface ArchivosSeo {
  robotsExiste: boolean
  robotsEstado: number
  robotsSitemaps: string[]
  robotsBloqueaTodo: boolean
  sitemapUrl: string
  sitemapExiste: boolean
  sitemapEstado: number
  sitemapUrls: number
  sitemapEsIndice: boolean
}

/** Resumen de PageSpeed móvil (se mide desde el navegador, aparte de la auditoría). */
export interface VelocidadSeo {
  performance: number
  seo: number
  accesibilidad: number
  buenasPracticas: number
  lcp: string | null
  cls: string | null
  estrategia: 'mobile'
  fecha: string
}

/** Resultado completo que devuelve el Worker en /api/seo/auditar. */
export interface DatosSeo {
  url: string
  urlFinal: string
  dominio: string
  httpStatus: number
  https: boolean
  tiempoMs: number
  bytes: number
  recortado: boolean
  contenido: ContenidoSeo
  tecnico: TecnicoSeo
  archivos: ArchivosSeo
  chequeos: ChequeoSeo[]
  puntaje: number
  fecha: string
  velocidad?: VelocidadSeo | null
}

/** Fila de la tabla seo_auditorias. */
export interface AuditoriaSeo {
  id: string
  url: string
  dominio: string
  puntaje: number
  datos: DatosSeo
  created_at: string
}
