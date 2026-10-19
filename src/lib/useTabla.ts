import { useCallback, useEffect, useState } from 'react'
import { useAvisos } from './avisos'
import { supabase } from './supabase'

interface ErrorSupabase {
  code?: string
  message: string
}

function traducirError(error: ErrorSupabase, tabla: string): string {
  if (error.code === 'PGRST205' || error.message.includes('does not exist')) {
    return `La tabla "${tabla}" todavía no existe. Aplica las migraciones (workflow "Migrar base de datos" en GitHub o los archivos de supabase/sql).`
  }
  return `No se pudieron cargar los datos: ${error.message}`
}

/**
 * Carga y mantiene una tabla de Supabase (listar, crear/editar, eliminar)
 * con avisos automáticos de éxito y error.
 */
export function useTabla<T extends { id: string }>(tabla: string, select = '*', orden = 'created_at') {
  const [filas, setFilas] = useState<T[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const aviso = useAvisos()

  const cargar = useCallback(async () => {
    if (!supabase) return
    const { data, error: errorConsulta } = await supabase.from(tabla).select(select).order(orden, { ascending: false })
    if (errorConsulta) {
      setError(traducirError(errorConsulta, tabla))
    } else {
      setError(null)
      setFilas((data ?? []) as unknown as T[])
    }
    setCargando(false)
  }, [tabla, select, orden])

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- los setState ocurren después del await, no de forma sincrónica
    void cargar()
  }, [cargar])

  async function guardar(valores: Record<string, unknown>, id?: string): Promise<boolean> {
    if (!supabase) return false
    const { error: errorGuardar } = id
      ? await supabase.from(tabla).update(valores).eq('id', id)
      : await supabase.from(tabla).insert(valores)
    if (errorGuardar) {
      aviso(`No se pudo guardar: ${errorGuardar.message}`, 'error')
      return false
    }
    aviso(id ? 'Cambios guardados' : 'Registro creado')
    await cargar()
    return true
  }

  async function eliminar(id: string) {
    if (!supabase) return
    const { error: errorEliminar } = await supabase.from(tabla).delete().eq('id', id)
    if (errorEliminar) {
      aviso(`No se pudo eliminar: ${errorEliminar.message}`, 'error')
      return
    }
    aviso('Registro eliminado')
    await cargar()
  }

  return { filas, cargando, error, cargar, guardar, eliminar }
}

export interface ClienteOpcion {
  id: string
  nombre: string
  empresa: string | null
}

/** Lista ligera de clientes (id + nombre) para los selectores de los formularios. */
export function useListaClientes(): ClienteOpcion[] {
  const [clientes, setClientes] = useState<ClienteOpcion[]>([])

  useEffect(() => {
    if (!supabase) return
    void supabase
      .from('clientes')
      .select('id, nombre, empresa')
      .order('nombre')
      .then(({ data }) => {
        if (data) setClientes(data as ClienteOpcion[])
      })
  }, [])

  return clientes
}
