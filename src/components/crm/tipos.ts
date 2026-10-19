import type { ActividadCrm, ContactoCrm, EmpresaCrm, OportunidadCrm } from '../../types/crm'

export type PestanaCrm = 'pipeline' | 'empresas' | 'contactos' | 'actividades'

/** Forma común de los hooks `useTabla` que usan las pestañas del CRM. */
export interface TablaCrm<T> {
  filas: T[]
  cargando: boolean
  error: string | null
  cargar: () => Promise<void>
  guardar: (valores: Record<string, unknown>, id?: string) => Promise<boolean>
  eliminar: (id: string) => Promise<void>
}

export interface PropsPipeline {
  oportunidades: TablaCrm<OportunidadCrm>
  empresas: EmpresaCrm[]
  contactos: ContactoCrm[]
  refrescar: () => Promise<void>
  onIrAEmpresas: () => void
}

export interface PropsEmpresas {
  empresas: TablaCrm<EmpresaCrm>
  contactos: ContactoCrm[]
  oportunidades: OportunidadCrm[]
  refrescar: () => Promise<void>
}

export interface PropsContactos {
  contactos: TablaCrm<ContactoCrm>
  empresas: EmpresaCrm[]
  refrescar: () => Promise<void>
  onIrAEmpresas: () => void
}

export interface PropsActividades {
  actividades: TablaCrm<ActividadCrm>
  oportunidades: OportunidadCrm[]
  contactos: ContactoCrm[]
}
