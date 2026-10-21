import type {
  CandidatoTalento,
  EmpresaTalento,
  PostulacionTalento,
  VacanteTalento,
} from '../../types/talento'

export type PestanaTalento = 'resumen' | 'candidatos' | 'empresas' | 'vacantes' | 'procesos'

/** Contrato mínimo que comparten los hooks de tabla del panel. */
export interface TablaTalento<T extends { id: string }> {
  filas: T[]
  cargando: boolean
  error: string | null
  cargar: () => Promise<void>
  guardar: (valores: Record<string, unknown>, id?: string) => Promise<boolean>
  eliminar: (id: string) => Promise<void>
}

export interface PropsCandidatos {
  candidatos: TablaTalento<CandidatoTalento>
  postulaciones: PostulacionTalento[]
  refrescar: () => Promise<void>
  onIrAProcesos: () => void
}

export interface PropsEmpresasTalento {
  empresas: TablaTalento<EmpresaTalento>
  vacantes: VacanteTalento[]
  postulaciones: PostulacionTalento[]
  refrescar: () => Promise<void>
  onIrAVacantes: () => void
}

export interface PropsVacantes {
  vacantes: TablaTalento<VacanteTalento>
  empresas: EmpresaTalento[]
  candidatos: CandidatoTalento[]
  postulaciones: TablaTalento<PostulacionTalento>
  refrescar: () => Promise<void>
  onIrAProcesos: () => void
  onIrACandidatos: () => void
}

export interface PropsProcesos {
  postulaciones: TablaTalento<PostulacionTalento>
  candidatos: TablaTalento<CandidatoTalento>
  empresas: EmpresaTalento[]
  vacantes: VacanteTalento[]
  refrescar: () => Promise<void>
}
