import { createContext, useContext } from 'react'

export type TipoAviso = 'ok' | 'error'

/** Contexto interno de avisos; el componente proveedor vive en components/toast.tsx. */
export const ContextoAvisos = createContext<(texto: string, tipo?: TipoAviso) => void>(() => {})

/** Muestra avisos flotantes (éxito/error) en toda la app. */
export function useAvisos() {
  return useContext(ContextoAvisos)
}
