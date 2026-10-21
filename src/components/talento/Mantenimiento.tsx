import { Eraser, FileSearch, Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { borrarCVs, listarCVHuerfanos } from '../../lib/talento'
import type { CandidatoTalento } from '../../types/talento'
import { Boton, Tarjeta } from '../ui'

type EstadoRevision = 'inicial' | 'revisando' | 'listo' | 'borrando'

/**
 * Revisa el bucket privado de CV y borra los PDF que quedaron sin candidato
 * (por ejemplo, cuando se elimina un perfil). Solo el personal con sesión
 * puede listar y borrar: las políticas de Storage lo exigen.
 */
export function MantenimientoCV({ candidatos }: { candidatos: CandidatoTalento[] }) {
  const [estado, setEstado] = useState<EstadoRevision>('inicial')
  const [rutas, setRutas] = useState<string[]>([])
  const [truncado, setTruncado] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  async function revisar() {
    setEstado('revisando')
    setMensaje(null)
    const resultado = await listarCVHuerfanos(candidatos.map((candidato) => candidato.cv_path))
    if ('error' in resultado) {
      setMensaje(resultado.error)
      setEstado('inicial')
      return
    }
    setRutas(resultado.rutas)
    setTruncado(resultado.truncado)
    setEstado('listo')
  }

  async function limpiar() {
    if (rutas.length === 0) return
    setEstado('borrando')
    const resultado = await borrarCVs(rutas)
    if ('error' in resultado) {
      setMensaje(resultado.error)
      setEstado('listo')
      return
    }
    setMensaje(`Se borraron ${resultado.borrados} CV que ya no pertenecían a ningún perfil.`)
    setRutas([])
    setEstado('inicial')
  }

  const ocupado = estado === 'revisando' || estado === 'borrando'

  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
          <ShieldCheck size={16} className="text-exito" /> Mantenimiento de CV
        </p>
        <Boton variante="secundario" disabled={ocupado} onClick={() => void revisar()}>
          {estado === 'revisando' ? <Loader2 size={15} className="animate-spin" /> : <FileSearch size={15} />}
          Buscar CV sin dueño
        </Boton>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-tinta-suave">
        Revisa el bucket privado y detecta PDF que quedaron sin candidato, por ejemplo al eliminar un perfil. Solo el
        personal con sesión puede verlos y borrarlos.
      </p>

      {mensaje && (
        <p className="mt-3 rounded-[16px] border border-borde bg-superficie-2/50 p-3 text-xs leading-relaxed text-tinta-suave">
          {mensaje}
        </p>
      )}

      {estado === 'listo' && rutas.length > 0 && (
        <div className="mt-3 rounded-[16px] border border-aviso-borde bg-aviso-suave p-3 text-xs text-aviso">
          <p className="font-semibold">
            {rutas.length} CV sin candidato
          </p>
          <p className="mt-1 leading-relaxed">
            Son PDF que ya no pertenecen a ningún perfil.
            {truncado ? ' La revisión se limitó a 1000 archivos: limpia y vuelve a buscar para continuar.' : ''}
          </p>
          <Boton type="button" variante="secundario" className="mt-3" onClick={() => void limpiar()}>
            <Eraser size={15} /> Borrar {rutas.length}
          </Boton>
        </div>
      )}

      {estado === 'listo' && rutas.length === 0 && (
        <p className="mt-3 rounded-[16px] border border-exito-borde bg-exito-suave p-3 text-xs text-exito">
          Todo limpio: cada CV del bucket pertenece a un candidato.
        </p>
      )}
    </Tarjeta>
  )
}
