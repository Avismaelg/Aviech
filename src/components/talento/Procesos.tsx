import {
  Building2,
  CalendarClock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useMemo, useState, type DragEvent, type FormEvent } from 'react'
import { useAvisos } from '../../lib/avisos'
import {
  ETAPAS_TALENTO,
  ORIGENES_TALENTO,
  TIPOS_ENTREVISTA,
  colorEtapaTalento,
  colorOrigenTalento,
  etiquetaEtapaTalento,
  etiquetaOrigenTalento,
  etiquetaTipoEntrevista,
} from '../../lib/etiquetas'
import { formatoDinero, formatoFecha } from '../../lib/formato'
import { abrirCV, desdeInputFechaHora, formatoFechaHora, paraInputFechaHora } from '../../lib/talento'
import type { PostulacionTalento } from '../../types/talento'
import {
  AreaTexto,
  Boton,
  Campo,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Insignia,
  Modal,
  Selector,
  Tarjeta,
  Vacio,
} from '../ui'
import type { PropsProcesos } from './tipos'

interface FormularioNuevo {
  candidato_id: string
  empresa_id: string
  vacante_id: string
  etapa: string
  origen: string
  notas: string
}

const FORMULARIO_NUEVO: FormularioNuevo = {
  candidato_id: '',
  empresa_id: '',
  vacante_id: '',
  etapa: 'recibida',
  origen: 'interno',
  notas: '',
}

interface FormularioDetalle {
  etapa: string
  notas: string
  fecha_entrevista: string
  entrevista_tipo: string
  entrevistador: string
  resultado_entrevista: string
  fecha_inicio: string
  salario_final: string
  comision: string
}

const FORMULARIO_DETALLE_VACIO: FormularioDetalle = {
  etapa: 'recibida',
  notas: '',
  fecha_entrevista: '',
  entrevista_tipo: '',
  entrevistador: '',
  resultado_entrevista: '',
  fecha_inicio: '',
  salario_final: '',
  comision: '',
}

const ACENTO_ETAPA: Record<string, string> = {
  recibida: 'bg-tinta-tenue',
  preseleccion: 'bg-acento-claro',
  entrevista: 'bg-info',
  oferta: 'bg-aviso',
  contratada: 'bg-exito',
  rechazada: 'bg-peligro',
}

export function Procesos({ postulaciones, candidatos, empresas, vacantes, refrescar }: PropsProcesos) {
  const aviso = useAvisos()
  const [busqueda, setBusqueda] = useState('')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [formularioNuevo, setFormularioNuevo] = useState<FormularioNuevo>(FORMULARIO_NUEVO)
  const [detalle, setDetalle] = useState<PostulacionTalento | null>(null)
  const [formularioDetalle, setFormularioDetalle] = useState<FormularioDetalle>(FORMULARIO_DETALLE_VACIO)
  const [porEliminar, setPorEliminar] = useState<PostulacionTalento | null>(null)
  const [guardandoNuevo, setGuardandoNuevo] = useState(false)
  const [guardandoDetalle, setGuardandoDetalle] = useState(false)
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null)
  const [columnaActiva, setColumnaActiva] = useState<string | null>(null)

  const candidatosPorId = useMemo(
    () => new Map(candidatos.filas.map((candidato) => [candidato.id, candidato])),
    [candidatos.filas],
  )

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return postulaciones.filas.filter((proceso) => {
      if (!texto) return true
      return [
        proceso.talento_candidatos?.nombre,
        candidatosPorId.get(proceso.candidato_id)?.nombre,
        proceso.talento_empresas?.nombre,
        proceso.talento_vacantes?.titulo,
        proceso.notas,
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [postulaciones.filas, busqueda, candidatosPorId])

  const porEtapa = useMemo(() => {
    const mapa: Record<string, PostulacionTalento[]> = {}
    for (const etapa of ETAPAS_TALENTO) mapa[etapa] = []
    for (const proceso of filtradas) {
      if (!mapa[proceso.etapa]) mapa[proceso.etapa] = []
      mapa[proceso.etapa].push(proceso)
    }
    return mapa
  }, [filtradas])

  const vacantesDeEmpresa = useMemo(
    () => vacantes.filter((vacante) => !formularioNuevo.empresa_id || vacante.empresa_id === formularioNuevo.empresa_id),
    [vacantes, formularioNuevo.empresa_id],
  )

  const candidatoDetalle = detalle
    ? detalle.talento_candidatos ?? candidatosPorId.get(detalle.candidato_id) ?? null
    : null

  function abrirNuevo() {
    setFormularioNuevo({
      ...FORMULARIO_NUEVO,
      empresa_id: empresas.length === 1 ? empresas[0].id : '',
      candidato_id: candidatos.filas.length === 1 ? candidatos.filas[0].id : '',
    })
    setModalNuevo(true)
  }

  function abrirDetalle(proceso: PostulacionTalento) {
    setDetalle(proceso)
    setFormularioDetalle({
      etapa: proceso.etapa,
      notas: proceso.notas ?? '',
      fecha_entrevista: paraInputFechaHora(proceso.fecha_entrevista),
      entrevista_tipo: proceso.entrevista_tipo ?? '',
      entrevistador: proceso.entrevistador ?? '',
      resultado_entrevista: proceso.resultado_entrevista ?? '',
      fecha_inicio: proceso.fecha_inicio ?? '',
      salario_final: proceso.salario_final == null ? '' : String(proceso.salario_final),
      comision: proceso.comision == null ? '' : String(proceso.comision),
    })
  }

  async function crearProceso(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardandoNuevo) return
    if (!formularioNuevo.candidato_id || !formularioNuevo.empresa_id) return
    setGuardandoNuevo(true)
    const guardado = await postulaciones.guardar({
      candidato_id: formularioNuevo.candidato_id,
      empresa_id: formularioNuevo.empresa_id,
      vacante_id: formularioNuevo.vacante_id || null,
      etapa: formularioNuevo.etapa,
      origen: formularioNuevo.origen,
      notas: formularioNuevo.notas.trim() || null,
    })
    setGuardandoNuevo(false)
    if (guardado) {
      setModalNuevo(false)
      await refrescar()
    }
  }

  async function guardarDetalle(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!detalle || guardandoDetalle) return
    setGuardandoDetalle(true)
    const guardado = await postulaciones.guardar(
      {
        etapa: formularioDetalle.etapa,
        notas: formularioDetalle.notas.trim() || null,
        fecha_entrevista: desdeInputFechaHora(formularioDetalle.fecha_entrevista),
        entrevista_tipo: formularioDetalle.entrevista_tipo || null,
        entrevistador: formularioDetalle.entrevistador.trim() || null,
        resultado_entrevista: formularioDetalle.resultado_entrevista.trim() || null,
        fecha_inicio: formularioDetalle.fecha_inicio || null,
        salario_final:
          formularioDetalle.salario_final === '' ? null : Math.max(0, Number(formularioDetalle.salario_final) || 0),
        comision: formularioDetalle.comision === '' ? null : Math.max(0, Number(formularioDetalle.comision) || 0),
      },
      detalle.id,
    )
    if (guardado) {
      if (formularioDetalle.etapa === 'contratada') {
        await candidatos.guardar({ estado: 'contratado' }, detalle.candidato_id)
      }
      setDetalle(null)
      await refrescar()
    }
    setGuardandoDetalle(false)
  }

  function soltar(evento: DragEvent<HTMLDivElement>, etapa: string) {
    evento.preventDefault()
    setColumnaActiva(null)
    if (!arrastrandoId) return
    const proceso = postulaciones.filas.find((fila) => fila.id === arrastrandoId)
    setArrastrandoId(null)
    if (proceso && proceso.etapa !== etapa) {
      void (async () => {
        const guardado = await postulaciones.guardar({ etapa }, proceso.id)
        if (guardado && etapa === 'contratada') {
          await candidatos.guardar({ estado: 'contratado' }, proceso.candidato_id)
        }
        if (guardado) await refrescar()
      })()
    }
  }

  async function eliminarProceso() {
    if (!porEliminar) return
    await postulaciones.eliminar(porEliminar.id)
    setPorEliminar(null)
    setDetalle(null)
    await refrescar()
  }

  async function verCV() {
    if (!candidatoDetalle) return
    const resultado = await abrirCV(candidatoDetalle.cv_path, candidatoDetalle.cv_url)
    if ('error' in resultado) aviso(resultado.error, 'error')
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por candidato, empresa o vacante…"
            className="pl-9"
          />
        </div>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nuevo proceso
        </Boton>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtradas.length} proceso{filtradas.length === 1 ? '' : 's'} en pantalla
      </p>

      {postulaciones.error && <ErrorTabla mensaje={postulaciones.error} />}

      {postulaciones.cargando && !postulaciones.error && (
        <Tarjeta>
          <FilasCargando filas={6} />
        </Tarjeta>
      )}

      {!postulaciones.cargando && !postulaciones.error && postulaciones.filas.length === 0 && (
        <Tarjeta>
          <Vacio
            icono={<UserRound size={22} />}
            titulo="Todavía no hay procesos"
            texto="Cuando un candidato se postule o una empresa solicite una entrevista, aparecerá aquí. También puedes crear un proceso manualmente."
            accion={
              candidatos.filas.length === 0 || empresas.length === 0 ? (
                <p className="text-sm text-tinta-tenue">Registra al menos un candidato y una empresa.</p>
              ) : (
                <Boton variante="secundario" onClick={abrirNuevo}>
                  <Plus size={16} /> Crear proceso
                </Boton>
              )
            }
          />
        </Tarjeta>
      )}

      {!postulaciones.cargando &&
        !postulaciones.error &&
        postulaciones.filas.length > 0 &&
        filtradas.length === 0 && (
          <Tarjeta>
            <Vacio
              icono={<Search size={22} />}
              titulo="Sin resultados"
              texto="Prueba otra búsqueda."
              accion={
                <Boton variante="secundario" onClick={() => setBusqueda('')}>
                  Limpiar búsqueda
                </Boton>
              }
            />
          </Tarjeta>
        )}

      {!postulaciones.cargando &&
        !postulaciones.error &&
        postulaciones.filas.length > 0 &&
        filtradas.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ETAPAS_TALENTO.map((etapa) => {
                const lista = porEtapa[etapa] ?? []
                return (
                  <div
                    key={etapa}
                    onDragOver={(evento) => {
                      evento.preventDefault()
                      setColumnaActiva(etapa)
                    }}
                    onDrop={(evento) => soltar(evento, etapa)}
                    className={`min-w-0 rounded-[20px] border bg-superficie/60 transition-colors ${
                      columnaActiva === etapa ? 'border-arena-borde bg-acento/5' : 'border-borde'
                    }`}
                  >
                    <div className="flex items-center gap-2 border-b border-borde-suave px-3 py-2.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${ACENTO_ETAPA[etapa] ?? 'bg-tinta-tenue'}`} />
                      <span className="text-xs font-semibold text-tinta">{etiquetaEtapaTalento[etapa]}</span>
                      <span className="rounded-full bg-superficie-2 px-1.5 text-[11px] text-tinta-tenue tabular-nums">
                        {lista.length}
                      </span>
                    </div>
                    <div className="space-y-2 p-2">
                      {lista.length === 0 && (
                        <p className="px-2 py-6 text-center text-xs text-tinta-tenue">Sin procesos</p>
                      )}
                      {lista.map((proceso) => {
                        const candidato = proceso.talento_candidatos ?? candidatosPorId.get(proceso.candidato_id)
                        return (
                          <article
                            key={proceso.id}
                            draggable
                            onDragStart={(evento) => {
                              setArrastrandoId(proceso.id)
                              evento.dataTransfer.effectAllowed = 'move'
                              evento.dataTransfer.setData('text/plain', proceso.id)
                            }}
                            onDragEnd={() => {
                              setArrastrandoId(null)
                              setColumnaActiva(null)
                            }}
                            className={`group relative rounded-[18px] border border-borde-suave bg-superficie-2/80 transition-opacity ${
                              arrastrandoId === proceso.id ? 'opacity-50' : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => abrirDetalle(proceso)}
                              className="block w-full rounded-[18px] p-3 text-left"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-medium text-tinta">
                                  {candidato?.nombre ?? 'Candidato'}
                                </p>
                                {proceso.match_score != null && (
                                  <Insignia color="emerald">{proceso.match_score}%</Insignia>
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-xs text-tinta-suave">
                                {proceso.talento_empresas?.nombre ?? 'Empresa'}
                              </p>
                              <p className="truncate text-[11px] text-tinta-tenue">
                                {proceso.talento_vacantes?.titulo ?? 'Solicitud directa'}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <Insignia color={colorOrigenTalento[proceso.origen]}>
                                  {etiquetaOrigenTalento[proceso.origen] ?? proceso.origen}
                                </Insignia>
                                {proceso.solicitud_tipo === 'contratacion' && (
                                  <Insignia color="amber">Contratación</Insignia>
                                )}
                              </div>
                              {proceso.fecha_entrevista && (
                                <p className="mt-2 flex items-center gap-1 text-[11px] text-info">
                                  <CalendarClock size={11} /> {formatoFechaHora(proceso.fecha_entrevista)}
                                </p>
                              )}
                            </button>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        )}

      <Modal
        abierto={modalNuevo}
        titulo="Nuevo proceso"
        onCerrar={() => setModalNuevo(false)}
        ancho="sm:max-w-2xl"
      >
        <form onSubmit={crearProceso} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Candidato *">
            <Selector
              required
              value={formularioNuevo.candidato_id}
              onChange={(evento) => setFormularioNuevo({ ...formularioNuevo, candidato_id: evento.target.value })}
            >
              <option value="">Selecciona un candidato…</option>
              {candidatos.filas.map((candidato) => (
                <option key={candidato.id} value={candidato.id}>
                  {candidato.nombre} · {candidato.puesto_objetivo}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Empresa *">
            <Selector
              required
              value={formularioNuevo.empresa_id}
              onChange={(evento) =>
                setFormularioNuevo({ ...formularioNuevo, empresa_id: evento.target.value, vacante_id: '' })
              }
            >
              <option value="">Selecciona una empresa…</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Vacante">
            <Selector
              value={formularioNuevo.vacante_id}
              onChange={(evento) => setFormularioNuevo({ ...formularioNuevo, vacante_id: evento.target.value })}
            >
              <option value="">Solicitud directa / sin vacante</option>
              {vacantesDeEmpresa.map((vacante) => (
                <option key={vacante.id} value={vacante.id}>
                  {vacante.titulo}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Etapa">
            <Selector
              value={formularioNuevo.etapa}
              onChange={(evento) => setFormularioNuevo({ ...formularioNuevo, etapa: evento.target.value })}
            >
              {ETAPAS_TALENTO.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etiquetaEtapaTalento[etapa]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Origen">
            <Selector
              value={formularioNuevo.origen}
              onChange={(evento) => setFormularioNuevo({ ...formularioNuevo, origen: evento.target.value })}
            >
              {ORIGENES_TALENTO.map((origen) => (
                <option key={origen} value={origen}>
                  {etiquetaOrigenTalento[origen]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              maxLength={2000}
              value={formularioNuevo.notas}
              onChange={(evento) => setFormularioNuevo({ ...formularioNuevo, notas: evento.target.value })}
              placeholder="Contexto de la postulación, expectativas, siguiente paso…"
            />
          </Campo>
          {(candidatos.filas.length === 0 || empresas.length === 0) && (
            <p className="rounded-[18px] border border-aviso-borde bg-aviso-suave px-3 py-2 text-xs text-aviso sm:col-span-2">
              Necesitas al menos un candidato y una empresa empleadora para crear un proceso.
            </p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalNuevo(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardandoNuevo || candidatos.filas.length === 0 || empresas.length === 0}>
              {guardandoNuevo ? 'Creando…' : 'Crear proceso'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={detalle !== null}
        titulo={candidatoDetalle ? candidatoDetalle.nombre : 'Detalle del proceso'}
        onCerrar={() => setDetalle(null)}
        ancho="sm:max-w-3xl"
      >
        {detalle && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Insignia color={colorEtapaTalento[detalle.etapa]}>
                    {etiquetaEtapaTalento[detalle.etapa] ?? detalle.etapa}
                  </Insignia>
                  <Insignia color={colorOrigenTalento[detalle.origen]}>
                    {etiquetaOrigenTalento[detalle.origen] ?? detalle.origen}
                  </Insignia>
                  {detalle.match_score != null && <Insignia color="emerald">{detalle.match_score}% match</Insignia>}
                  {detalle.solicitud_tipo && (
                    <Insignia color="blue">
                      {detalle.solicitud_tipo === 'contratacion' ? 'Solicitud de contratación' : 'Solicitud de entrevista'}
                    </Insignia>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <Building2 size={14} /> {detalle.talento_empresas?.nombre ?? 'Empresa'} ·{' '}
                  {detalle.talento_vacantes?.titulo ?? 'Solicitud directa'}
                </p>
                {candidatoDetalle && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tinta-tenue">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} /> {candidatoDetalle.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {candidatoDetalle.telefono || 'Sin teléfono'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {candidatoDetalle.ubicacion || 'Sin ubicación'}
                    </span>
                  </p>
                )}
              </div>
              {candidatoDetalle && (candidatoDetalle.cv_path || candidatoDetalle.cv_url) && (
                <Boton variante="secundario" onClick={() => void verCV()}>
                  <FileText size={15} /> Abrir CV
                </Boton>
              )}
            </div>

            {detalle.match_motivo && (
              <div className="rounded-[20px] border border-arena-borde bg-arena/40 p-3 text-sm text-tinta-suave">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  <Sparkles size={12} /> Por qué encaja
                </p>
                {detalle.match_motivo}
              </div>
            )}

            {candidatoDetalle && (candidatoDetalle.habilidades ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(candidatoDetalle.habilidades ?? []).map((habilidad) => (
                  <Insignia key={habilidad} color="blue">
                    {habilidad}
                  </Insignia>
                ))}
              </div>
            )}

            <form onSubmit={guardarDetalle} className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Etapa">
                <Selector
                  value={formularioDetalle.etapa}
                  onChange={(evento) => setFormularioDetalle({ ...formularioDetalle, etapa: evento.target.value })}
                >
                  {ETAPAS_TALENTO.map((etapa) => (
                    <option key={etapa} value={etapa}>
                      {etiquetaEtapaTalento[etapa]}
                    </option>
                  ))}
                </Selector>
              </Campo>
              <Campo etiqueta="Fecha y hora de entrevista">
                <Entrada
                  type="datetime-local"
                  value={formularioDetalle.fecha_entrevista}
                  onChange={(evento) =>
                    setFormularioDetalle({ ...formularioDetalle, fecha_entrevista: evento.target.value })
                  }
                />
              </Campo>
              <Campo etiqueta="Tipo de entrevista">
                <Selector
                  value={formularioDetalle.entrevista_tipo}
                  onChange={(evento) =>
                    setFormularioDetalle({ ...formularioDetalle, entrevista_tipo: evento.target.value })
                  }
                >
                  <option value="">Sin indicar</option>
                  {TIPOS_ENTREVISTA.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {etiquetaTipoEntrevista[tipo]}
                    </option>
                  ))}
                </Selector>
              </Campo>
              <Campo etiqueta="Entrevistador">
                <Entrada
                  maxLength={120}
                  value={formularioDetalle.entrevistador}
                  onChange={(evento) =>
                    setFormularioDetalle({ ...formularioDetalle, entrevistador: evento.target.value })
                  }
                  placeholder="Nombre de quien entrevista"
                />
              </Campo>
              <Campo etiqueta="Resultado de la entrevista" className="sm:col-span-2">
                <AreaTexto
                  maxLength={2000}
                  value={formularioDetalle.resultado_entrevista}
                  onChange={(evento) =>
                    setFormularioDetalle({ ...formularioDetalle, resultado_entrevista: evento.target.value })
                  }
                  placeholder="Impresión, fortalezas, riesgos, siguiente paso…"
                />
              </Campo>
              <Campo etiqueta="Notas del proceso" className="sm:col-span-2">
                <AreaTexto
                  maxLength={3000}
                  value={formularioDetalle.notas}
                  onChange={(evento) => setFormularioDetalle({ ...formularioDetalle, notas: evento.target.value })}
                  placeholder="Condiciones, seguimiento, comentarios internos…"
                />
              </Campo>
              <Campo etiqueta="Fecha de inicio">
                <Entrada
                  type="date"
                  value={formularioDetalle.fecha_inicio}
                  onChange={(evento) => setFormularioDetalle({ ...formularioDetalle, fecha_inicio: evento.target.value })}
                />
              </Campo>
              <Campo etiqueta="Salario final (RD$)">
                <Entrada
                  type="number"
                  min="0"
                  step="0.01"
                  value={formularioDetalle.salario_final}
                  onChange={(evento) => setFormularioDetalle({ ...formularioDetalle, salario_final: evento.target.value })}
                  placeholder="Opcional"
                />
              </Campo>
              <Campo etiqueta="Comisión (RD$)">
                <Entrada
                  type="number"
                  min="0"
                  step="0.01"
                  value={formularioDetalle.comision}
                  onChange={(evento) => setFormularioDetalle({ ...formularioDetalle, comision: evento.target.value })}
                  placeholder="Opcional"
                />
              </Campo>
              <div className="flex flex-col justify-end gap-2 sm:col-span-2 sm:flex-row sm:justify-between">
                <Boton
                  variante="peligro"
                  type="button"
                  onClick={() => setPorEliminar(detalle)}
                  className="sm:order-first"
                >
                  <Trash2 size={15} /> Eliminar proceso
                </Boton>
                <div className="flex gap-2">
                  <Boton variante="secundario" type="button" onClick={() => setDetalle(null)}>
                    Cancelar
                  </Boton>
                  <Boton type="submit" disabled={guardandoDetalle}>
                    {guardandoDetalle ? 'Guardando…' : 'Guardar cambios'}
                  </Boton>
                </div>
              </div>
            </form>

            <p className="text-[11px] text-tinta-tenue">
              Creado el {formatoFecha(detalle.created_at)}
              {detalle.fecha_inicio ? ` · Inicio ${formatoFecha(detalle.fecha_inicio)}` : ''}
              {detalle.salario_final != null ? ` · Salario final ${formatoDinero(detalle.salario_final)}` : ''}
            </p>
          </div>
        )}
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar proceso"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarProceso()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar el proceso de{' '}
              <strong className="text-tinta">
                {porEliminar.talento_candidatos?.nombre ?? candidatosPorId.get(porEliminar.candidato_id)?.nombre ?? 'este candidato'}
              </strong>
              ? Se perderán las notas, entrevistas y condiciones guardadas. Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </div>
  )
}
