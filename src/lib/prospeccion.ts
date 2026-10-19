import { supabase } from './supabase'
import type { DatosProspeccion } from '../types/prospeccion'

/**
 * En desarrollo el panel corre en Vite (otro puerto) y la API vive en el Worker
 * publicado; en producción todo es el mismo dominio (sin CORS).
 */
const BASE_API = import.meta.env.DEV ? 'https://aviech.avismael-eg.workers.dev' : ''

/** Llama al Worker del panel (mismo dominio en producción) con la sesión del usuario. */
export async function buscarContactos(url: string, token: string): Promise<DatosProspeccion> {
  const respuesta = await fetch(`${BASE_API}/api/scraper/contactos?url=${encodeURIComponent(url)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new Error(datos?.error || 'No se pudieron buscar los contactos. Inténtalo de nuevo.')
  }
  return datos as DatosProspeccion
}

export interface EmpresaExistente {
  id: string
  nombre: string
}

/** Comprueba si ya hay una empresa del CRM con ese dominio. */
export async function buscarEmpresaPorDominio(dominio: string): Promise<EmpresaExistente | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('crm_empresas')
    .select('id, nombre')
    .ilike('dominio', dominio)
    .limit(1)
    .maybeSingle()
  return (data as EmpresaExistente | null) ?? null
}

export interface DatosGuardarCrm {
  empresaExistenteId: string | null
  nombreEmpresa: string
  dominio: string
  sitioWeb: string
  telefonoEmpresa: string | null
  notasEmpresa: string | null
  contactoNombre: string
  email: string | null
  telefonoContacto: string | null
  linkedin: string | null
  notasContacto: string | null
}

/**
 * Crea la empresa del CRM (o reutiliza la existente con ese dominio) y le añade
 * un contacto con los datos elegidos.
 */
export async function guardarContactosEnCrm(datos: DatosGuardarCrm): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase no está configurado.' }

  let empresaId = datos.empresaExistenteId
  if (!empresaId) {
    const { data, error } = await supabase
      .from('crm_empresas')
      .insert({
        nombre: datos.nombreEmpresa,
        dominio: datos.dominio || null,
        sitio_web: datos.sitioWeb || null,
        telefono: datos.telefonoEmpresa,
        notas: datos.notasEmpresa,
      })
      .select('id')
      .single()
    if (error || !data) {
      return { ok: false, error: `No se pudo crear la empresa: ${error?.message ?? 'sin respuesta'}` }
    }
    empresaId = data.id as string
  }

  const { error: errorContacto } = await supabase.from('crm_contactos').insert({
    empresa_id: empresaId,
    nombre: datos.contactoNombre,
    email: datos.email,
    telefono: datos.telefonoContacto,
    linkedin: datos.linkedin,
    notas: datos.notasContacto,
  })
  if (errorContacto) {
    return { ok: false, error: `El contacto no se pudo guardar: ${errorContacto.message}` }
  }
  return { ok: true }
}
