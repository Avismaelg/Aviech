import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useAvisos } from '../../lib/avisos'
import {
  ESTADOS_VACANTE,
  MODALIDADES_TALENTO,
  SENIORITIES,
  TIPOS_CONTRATO,
  colorEstadoVacante,
  colorEtapaTalento,
  colorOrigenTalento,
  etiquetaEstadoVacante,
  etiquetaEtapaTalento,
  etiquetaModalidad,
  etiquetaOrigenTalento,
  etiquetaSeniority,
  etiquetaTipoContrato,
} from '../../lib/etiquetas'
import { formatoFecha } from '../../lib/formato'
import { rangoSalario, tokenSesion } from '../../lib/talento'
import type { SugerenciaTalento, VacanteTalento } from '../../types/talento'
import {
  AreaTexto,
  Boton,
  BotonIcono,
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
import type { PropsVacantes } from './tipos'

interface FormularioVacante {
  empresa_id: string
  titulo: string
  descripcion: string
  requisitos: string
  responsabilidades: string
  ubicacion: string
  modalidad: string
  seniority: string
  tipo_contrato: string
  salario_min: string
  salario_max: string
  estado: string
  publica: boolean
}

const FORMULARIO_VACIO: FormularioVacante = {
  empresa_id: '',
  titulo: '',
  descripcion: '',
  requisitos: '',
  responsabilidades: '',
  ubicacion: '',
  modalidad: 'hibrido',
  seniority: 'mid',
  tipo_contrato: 'tiempo_completo',
  salario_min: '',
  salario_max: '',
  estado: 'borrador',
  publica: false,
}

interface RespuestaMatch {
  ok?: boolean
  sugerencias?: SugerenciaTalento[]
  error?: string
  mensaje?: string
}

export function Vacantes({
  vacantes,
  empresas,
  candidatos,
  postulaciones,
  refrescar,
  onIrAProcesos,
  onIrACandidatos,
}: PropsVacantes) {
  const aviso = useAvisos()
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioVacante>(FORMULARIO_VACIO)
  const [detalle, setDetalle] = useState<VacanteTalento | null>(null)
  const [porEliminar, setPorEliminar] = useState<VacanteTalento | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [cambiandoPortal, setCambiandoPortal] = useState(false)
  const [buscandoIA, setBuscandoIA] = useState(false)
  const [errorIA, setErrorIA] = useState<string | null>(null)
  const [sugerencias, setSugerencias] = useState<SugerenciaTalento[]>([])
  const [agregados, setAgregados] = useState<Set<string>>(new Set())
  const [agregandoId, setAgregandoId] = useState<string | null>(null)

  const candidatosPorId = useMemo(
    () => new Map(candidatos.map((candidato) => [candidato.id, candidato])),
    [candidatos],
  )

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return vacantes.filas.filter((vacante) => {
      if (estadoFiltro && vacante.estado !== estadoFiltro) return false
      if (!texto) return true
      return [
        vacante.titulo,
        vacante.descripcion,
        vacante.ubicacion,
        vacante.talento_empresas?.nombre,
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [vacantes.filas, busqueda, estadoFiltro])

  const procesosDeDetalle = useMemo(
    () => (detalle ? postulaciones.filas.filter((proceso) => proceso.vacante_id === detalle.id) : []),
    [postulaciones.filas, detalle],
  )

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario({ ...FORMULARIO_VACIO, empresa_id: empresas.length === 1 ? empresas[0].id : '' })
    setModalAbierto(true)
  }

  function abrirEdicion(vacante: VacanteTalento) {
    setDetalle(null)
    setEditandoId(vacante.id)
    setFormulario({
      empresa_id: vacante.empresa_id,
      titulo: vacante.titulo,
      descripcion: vacante.descripcion,
      requisitos: vacante.requisitos ?? '',
      responsabilidades: vacante.responsabilidades ?? '',
      ubicacion: vacante.ubicacion ?? '',
      modalidad: vacante.modalidad,
      seniority: vacante.seniority,
      tipo_contrato: vacante.tipo_contrato,
      salario_min: vacante.salario_min == null ? '' : String(vacante.salario_min),
      salario_max: vacante.salario_max == null ? '' : String(vacante.salario_max),
      estado: vacante.estado,
      publica: vacante.publica,
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando) return
    if (!formulario.empresa_id || !formulario.titulo.trim() || formulario.descripcion.trim().length < 20) return
    const minimo = formulario.salario_min === '' ? null : Math.max(0, Number(formulario.salario_min) || 0)
    const maximo = formulario.salario_max === '' ? null : Math.max(0, Number(formulario.salario_max) || 0)
    if (minimo != null && maximo != null && minimo > maximo) {
      aviso('El salario mínimo no puede ser mayor que el máximo.', 'error')
      return
    }
    setGuardando(true)
    const guardado = await vacantes.guardar(
      {
        empresa_id: formulario.empresa_id,
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        requisitos: formulario.requisitos.trim() || null,
        responsabilidades: formulario.responsabilidades.trim() || null,
        ubicacion: formulario.ubicacion.trim() || null,
        modalidad: formulario.modalidad,
        seniority: formulario.seniority,
        tipo_contrato: formulario.tipo_contrato,
        salario_min: minimo,
        salario_max: maximo,
        estado: formulario.estado,
        publica: formulario.publica,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  async function eliminarVacante() {
    if (!porEliminar) return
    await vacantes.eliminar(porEliminar.id)
    setPorEliminar(null)
    setDetalle(null)
    await refrescar()
  }

  async function alternarPortal() {
    if (!detalle || cambiandoPortal) return
    setCambiandoPortal(true)
    const nuevo = !detalle.publica
    const guardado = await vacantes.guardar({ publica: nuevo }, detalle.id)
    setCambiandoPortal(false)
    if (guardado) {
      setDetalle({ ...detalle, publica: nuevo })
      aviso(nuevo ? 'Vacante publicada en el portal' : 'Vacante retirada del portal')
    }
  }

  function abrirDetalle(vacante: VacanteTalento) {
    setDetalle(vacante)
    setSugerencias([])
    setErrorIA(null)
    setAgregados(new Set())
  }

  async function buscarConIA() {
    if (!detalle || buscandoIA) return
    setBuscandoIA(true)
    setErrorIA(null)
    setSugerencias([])
    setAgregados(new Set())
    try {
      const token = await tokenSesion()
      if (!token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      const respuesta = await fetch('/api/talento/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vacante_id: detalle.id }),
      })
      const datos = (await respuesta.json().catch(() => null)) as RespuestaMatch | null
      if (!respuesta.ok || !datos?.ok) {
        throw new Error(datos?.error || 'No se pudo ejecutar el matching con IA.')
      }
      setSugerencias(datos.sugerencias ?? [])
      if ((datos.sugerencias ?? []).length === 0) {
        setErrorIA(datos.mensaje || 'La IA no encontró candidatos nuevos para esta vacante.')
      }
    } catch (fallo) {
      setErrorIA(fallo instanceof Error ? fallo.message : 'No se pudo ejecutar el matching con IA.')
    } finally {
      setBuscandoIA(false)
    }
  }

  async function agregarSugerencia(sugerencia: SugerenciaTalento) {
    if (!detalle || agregandoId) return
    setAgregandoId(sugerencia.candidato_id)
    const guardado = await postulaciones.guardar({
      candidato_id: sugerencia.candidato_id,
      empresa_id: detalle.empresa_id,
      vacante_id: detalle.id,
      etapa: 'recibida',
      origen: 'ia',
      match_score: sugerencia.puntaje,
      match_motivo: sugerencia.motivo,
    })
    setAgregandoId(null)
    if (guardado) {
      setAgregados((previo) => new Set(previo).add(sugerencia.candidato_id))
      await refrescar()
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por puesto, empresa o ubicación…"
            className="pl-9"
          />
        </div>
        <Selector
          value={estadoFiltro}
          onChange={(evento) => setEstadoFiltro(evento.target.value)}
          aria-label="Filtrar por estado"
          className="sm:w-44"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_VACANTE.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoVacante[estado]}
            </option>
          ))}
        </Selector>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nueva vacante
        </Boton>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtradas.length} vacante{filtradas.length === 1 ? '' : 's'} en pantalla
      </p>

      <Tarjeta>
        {vacantes.error && <ErrorTabla mensaje={vacantes.error} />}
        {vacantes.cargando && !vacantes.error && <FilasCargando />}
        {!vacantes.cargando && !vacantes.error && filtradas.length === 0 && (
          vacantes.filas.length === 0 ? (
            <Vacio
              icono={<BriefcaseBusiness size={22} />}
              titulo="Todavía no hay vacantes"
              texto="Publica una búsqueda o recibe una vacante del portal. Después podrás recibir postulaciones y hacer matching con IA."
              accion={
                empresas.length === 0 ? (
                  <p className="text-sm text-tinta-tenue">Primero registra una empresa empleadora.</p>
                ) : (
                  <Boton variante="secundario" onClick={abrirNuevo}>
                    <Plus size={16} /> Crear vacante
                  </Boton>
                )
              }
            />
          ) : (
            <Vacio
              icono={<Search size={22} />}
              titulo="Sin resultados"
              texto="Prueba otra búsqueda o cambia el filtro de estado."
              accion={
                <Boton
                  variante="secundario"
                  onClick={() => {
                    setBusqueda('')
                    setEstadoFiltro('')
                  }}
                >
                  Limpiar filtros
                </Boton>
              }
            />
          )
        )}

        {!vacantes.cargando && !vacantes.error && filtradas.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtradas.map((vacante) => {
              const procesos = postulaciones.filas.filter((proceso) => proceso.vacante_id === vacante.id)
              return (
                <li key={vacante.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                  <button
                    type="button"
                    onClick={() => abrirDetalle(vacante)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-arena text-clay">
                      <BriefcaseBusiness size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-tinta">{vacante.titulo}</p>
                        <Insignia color={colorEstadoVacante[vacante.estado]}>
                          {etiquetaEstadoVacante[vacante.estado] ?? vacante.estado}
                        </Insignia>
                        {vacante.publica && <Insignia color="blue">Portal</Insignia>}
                      </div>
                      <p className="truncate text-xs text-tinta-suave">
                        {vacante.talento_empresas?.nombre ?? 'Empresa'} ·{' '}
                        {vacante.ubicacion || 'Sin ubicación'} · {etiquetaModalidad[vacante.modalidad]}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-tinta-tenue">
                        <span>{etiquetaSeniority[vacante.seniority] ?? vacante.seniority}</span>
                        <span>· {etiquetaTipoContrato[vacante.tipo_contrato] ?? vacante.tipo_contrato}</span>
                        <span>· {rangoSalario(vacante.salario_min, vacante.salario_max)}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-tinta-tenue">
                        {procesos.length} postulación{procesos.length === 1 ? '' : 'es'} · creada el{' '}
                        {formatoFecha(vacante.created_at)}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <BotonIcono etiqueta="Ver vacante" onClick={() => abrirDetalle(vacante)}>
                      <Users size={15} />
                    </BotonIcono>
                    <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(vacante)}>
                      <Pencil size={15} />
                    </BotonIcono>
                    <BotonIcono
                      etiqueta="Eliminar"
                      onClick={() => setPorEliminar(vacante)}
                      className="hover:bg-peligro-suave hover:text-peligro"
                    >
                      <Trash2 size={15} />
                    </BotonIcono>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar vacante' : 'Nueva vacante'}
        onCerrar={() => setModalAbierto(false)}
        ancho="sm:max-w-3xl"
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Empresa *">
            <Selector
              required
              value={formulario.empresa_id}
              onChange={(evento) => setFormulario({ ...formulario, empresa_id: evento.target.value })}
            >
              <option value="">Selecciona una empresa…</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Título del puesto *">
            <Entrada
              required
              maxLength={180}
              value={formulario.titulo}
              onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
              placeholder="Ej. Analista contable senior"
            />
          </Campo>
          {empresas.length === 0 && (
            <p className="rounded-[18px] border border-aviso-borde bg-aviso-suave px-3 py-2 text-xs text-aviso sm:col-span-2">
              No hay empresas empleadoras. Crea una primero para poder publicar la vacante.
            </p>
          )}
          <Campo etiqueta="Descripción *" className="sm:col-span-2">
            <AreaTexto
              required
              minLength={20}
              maxLength={5000}
              value={formulario.descripcion}
              onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
              placeholder="Qué hará la persona, contexto del equipo y objetivos del puesto…"
              className="min-h-32"
            />
          </Campo>
          <Campo etiqueta="Requisitos" className="sm:col-span-2">
            <AreaTexto
              maxLength={3000}
              value={formulario.requisitos}
              onChange={(evento) => setFormulario({ ...formulario, requisitos: evento.target.value })}
              placeholder="Formación, años de experiencia, herramientas, idiomas…"
            />
          </Campo>
          <Campo etiqueta="Responsabilidades" className="sm:col-span-2">
            <AreaTexto
              maxLength={3000}
              value={formulario.responsabilidades}
              onChange={(evento) => setFormulario({ ...formulario, responsabilidades: evento.target.value })}
              placeholder="Tareas principales y entregables del puesto."
            />
          </Campo>
          <Campo etiqueta="Ubicación">
            <Entrada
              maxLength={160}
              value={formulario.ubicacion}
              onChange={(evento) => setFormulario({ ...formulario, ubicacion: evento.target.value })}
              placeholder="Santo Domingo, RD"
            />
          </Campo>
          <Campo etiqueta="Modalidad">
            <Selector
              value={formulario.modalidad}
              onChange={(evento) => setFormulario({ ...formulario, modalidad: evento.target.value })}
            >
              {MODALIDADES_TALENTO.map((modalidad) => (
                <option key={modalidad} value={modalidad}>
                  {etiquetaModalidad[modalidad]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Seniority">
            <Selector
              value={formulario.seniority}
              onChange={(evento) => setFormulario({ ...formulario, seniority: evento.target.value })}
            >
              {SENIORITIES.map((seniority) => (
                <option key={seniority} value={seniority}>
                  {etiquetaSeniority[seniority]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Tipo de contrato">
            <Selector
              value={formulario.tipo_contrato}
              onChange={(evento) => setFormulario({ ...formulario, tipo_contrato: evento.target.value })}
            >
              {TIPOS_CONTRATO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {etiquetaTipoContrato[tipo]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Salario mínimo (RD$)">
            <Entrada
              type="number"
              min="0"
              step="0.01"
              value={formulario.salario_min}
              onChange={(evento) => setFormulario({ ...formulario, salario_min: evento.target.value })}
              placeholder="Opcional"
            />
          </Campo>
          <Campo etiqueta="Salario máximo (RD$)">
            <Entrada
              type="number"
              min="0"
              step="0.01"
              value={formulario.salario_max}
              onChange={(evento) => setFormulario({ ...formulario, salario_max: evento.target.value })}
              placeholder="Opcional"
            />
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_VACANTE.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoVacante[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <label className="flex items-center gap-2.5 rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave">
            <input
              type="checkbox"
              checked={formulario.publica}
              onChange={(evento) => setFormulario({ ...formulario, publica: evento.target.checked })}
              className="h-4 w-4 rounded border-borde accent-acento"
            />
            Mostrar en el portal público de talento.
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear vacante'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={detalle !== null}
        titulo={detalle ? detalle.titulo : 'Detalle de la vacante'}
        onCerrar={() => setDetalle(null)}
        ancho="sm:max-w-3xl"
      >
        {detalle && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Insignia color={colorEstadoVacante[detalle.estado]}>
                    {etiquetaEstadoVacante[detalle.estado] ?? detalle.estado}
                  </Insignia>
                  <Insignia color={detalle.publica ? 'blue' : 'slate'}>
                    {detalle.publica ? 'Visible en el portal' : 'Solo interna'}
                  </Insignia>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <Building2 size={14} /> {detalle.talento_empresas?.nombre ?? 'Empresa'}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tinta-tenue">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {detalle.ubicacion || 'Sin ubicación'}
                  </span>
                  <span>{etiquetaModalidad[detalle.modalidad]}</span>
                  <span>{etiquetaSeniority[detalle.seniority] ?? detalle.seniority}</span>
                  <span>{etiquetaTipoContrato[detalle.tipo_contrato] ?? detalle.tipo_contrato}</span>
                  <span>{rangoSalario(detalle.salario_min, detalle.salario_max)}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Boton variante="secundario" onClick={() => abrirEdicion(detalle)}>
                  <Pencil size={15} /> Editar
                </Boton>
                <Boton variante="secundario" onClick={() => void alternarPortal()} disabled={cambiandoPortal}>
                  {cambiandoPortal ? 'Guardando…' : detalle.publica ? 'Quitar del portal' : 'Publicar en portal'}
                </Boton>
              </div>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">Descripción</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-tinta-suave">{detalle.descripcion}</p>
            </div>
            {detalle.requisitos && (
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">Requisitos</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-tinta-suave">{detalle.requisitos}</p>
              </div>
            )}
            {detalle.responsabilidades && (
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  Responsabilidades
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-tinta-suave">{detalle.responsabilidades}</p>
              </div>
            )}

            <div className="rounded-[24px] border border-arena-borde bg-arena/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
                    <Sparkles size={15} className="text-acento" /> Matching con IA
                  </p>
                  <p className="mt-0.5 text-xs text-tinta-suave">
                    Analiza los perfiles activos y propone candidatos. No crea procesos automáticamente.
                  </p>
                </div>
                <Boton variante="secundario" onClick={() => void buscarConIA()} disabled={buscandoIA}>
                  <Sparkles size={15} /> {buscandoIA ? 'Analizando…' : 'Buscar candidatos'}
                </Boton>
              </div>

              {errorIA && (
                <p role="alert" className="mt-3 rounded-[16px] border border-aviso-borde bg-aviso-suave px-3 py-2 text-xs text-aviso">
                  {errorIA}
                </p>
              )}

              {sugerencias.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {sugerencias.map((sugerencia) => {
                    const candidato = candidatosPorId.get(sugerencia.candidato_id)
                    const yaAgregado = agregados.has(sugerencia.candidato_id)
                    return (
                      <li
                        key={sugerencia.candidato_id}
                        className="flex flex-wrap items-start justify-between gap-2 rounded-[18px] border border-borde bg-superficie p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-sm font-semibold text-tinta">
                              {sugerencia.nombre || candidato?.nombre || 'Candidato'}
                            </p>
                            <Insignia color="emerald">{Math.round(sugerencia.puntaje)}% match</Insignia>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-tinta-suave">
                            {candidato?.puesto_objetivo ?? 'Perfil activo'}
                            {candidato ? ` · ${etiquetaSeniority[candidato.seniority] ?? candidato.seniority}` : ''}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-tinta-suave">{sugerencia.motivo}</p>
                        </div>
                        <Boton
                          variante={yaAgregado ? 'secundario' : 'primario'}
                          disabled={yaAgregado || agregandoId === sugerencia.candidato_id}
                          onClick={() => void agregarSugerencia(sugerencia)}
                        >
                          {yaAgregado ? (
                            <>
                              <Check size={14} /> Agregado
                            </>
                          ) : agregandoId === sugerencia.candidato_id ? (
                            'Agregando…'
                          ) : (
                            'Agregar al pipeline'
                          )}
                        </Boton>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  Postulaciones ({procesosDeDetalle.length})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDetalle(null)
                    onIrAProcesos()
                  }}
                  className="text-xs font-semibold text-clay hover:text-acento"
                >
                  Ver pipeline
                </button>
              </div>
              {procesosDeDetalle.length === 0 ? (
                <p className="rounded-[18px] border border-borde bg-superficie-2/50 p-3 text-sm text-tinta-suave">
                  Todavía no hay postulaciones. Comparte el portal o agrega candidatos con el matching.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {procesosDeDetalle.map((proceso) => (
                    <li
                      key={proceso.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-borde bg-superficie px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate text-tinta">
                        {proceso.talento_candidatos?.nombre ?? candidatosPorId.get(proceso.candidato_id)?.nombre ?? 'Candidato'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Insignia color={colorOrigenTalento[proceso.origen]}>
                          {etiquetaOrigenTalento[proceso.origen] ?? proceso.origen}
                        </Insignia>
                        <Insignia color={colorEtapaTalento[proceso.etapa]}>
                          {etiquetaEtapaTalento[proceso.etapa] ?? proceso.etapa}
                        </Insignia>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-borde-suave pt-4">
              <p className="flex items-center gap-1.5 text-[11px] text-tinta-tenue">
                <CalendarClock size={12} /> Creada el {formatoFecha(detalle.created_at)}
              </p>
              <div className="flex gap-2">
                <Boton variante="secundario" onClick={() => setDetalle(null)}>
                  Cerrar
                </Boton>
                <Boton variante="secundario" onClick={onIrACandidatos}>
                  <Users size={15} /> Ver candidatos
                </Boton>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar vacante"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarVacante()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar <strong className="text-tinta">{porEliminar.titulo}</strong>? Las
              postulaciones se conservarán sin vacante asociada. Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </div>
  )
}
