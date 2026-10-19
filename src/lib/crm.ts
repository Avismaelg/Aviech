import type { ContactoCrm, EmpresaCrm } from '../types/crm'
import { supabase } from './supabase'

/**
 * Crea un cliente del panel a partir de una empresa del CRM y guarda el vínculo
 * (`crm_empresas.cliente_id`). Si la empresa ya es cliente, no hace nada.
 * Usa el contacto principal (si se pasa) para el nombre, correo y teléfono.
 */
export async function convertirEmpresaEnCliente(
  empresa: EmpresaCrm,
  contacto?: ContactoCrm | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase no está configurado.' }
  if (empresa.cliente_id) return { ok: true }

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nombre: contacto?.nombre ?? empresa.nombre,
      empresa: empresa.nombre,
      email: contacto?.email ?? null,
      telefono: contacto?.telefono ?? empresa.telefono ?? null,
      estado: 'activo',
      notas: 'Creado desde el CRM.',
    })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo crear el cliente.' }
  }

  const { error: errorVinculo } = await supabase
    .from('crm_empresas')
    .update({ cliente_id: data.id as string })
    .eq('id', empresa.id)

  if (errorVinculo) {
    return { ok: false, error: `El cliente se creó, pero no se pudo vincular la empresa: ${errorVinculo.message}` }
  }

  return { ok: true }
}
