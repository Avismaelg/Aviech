import {
  BriefcaseBusiness,
  CalendarClock,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useAvisos } from '../../lib/avisos'
import {
  DISPONIBILIDADES,
  ESTADOS_CANDIDATO,
  MODALIDADES_TALENTO,
  SENIORITIES,
  colorEstadoCandidato,
  colorEtapaTalento,
  etiquetaDisponibilidad,
  etiquetaEstadoCandidato,
  etiquetaEtapaTalento,
  etiquetaModalidad,
  etiquetaSeniority,
} from '../../lib/etiquetas'
import { formatoDinero, formatoFecha, iniciales } from '../../lib/formato'
import { abrirCV, habilidadesDesdeTexto, textoDesdeHabilidades } from '../../lib/talento'
import type { CandidatoTalento } from '../../types/talento'
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
import type { PropsCandidatos } from './tipos'

interface FormularioCandidato {
  nombre: string
  email: string
  telefono: string
  ubicacion: string
  puesto_objetivo: string
  seniority: string
  modalidad: string
  habilidades: string
  experiencia: string
  educacion: string
  disponibilidad: string
  expectativa_salarial: string
  cv_url: string
  estado: string
  visible_empresas: boolean
  consentimiento: boolean
  notas: string
}

const FORMULARIO_VACIO: FormularioCandidato = {
  nombre: '',
  email: '',
  telefono: '',
  ubicacion: '',
  puesto_objetivo: '',
  seniority: 'mid',
  modalidad: 'hibrido',
  habilidades: '',
  experiencia: '',
  educacion: '',
  disponibilidad: '',
  expectativa_salarial: '',
  cv_url: '',
  estado: 'nuevo',
  visible_empresas: true,
  consentimiento: true,
  notas: '',
}

export function Candidatos({ candidatos, postulaciones, refrescar, onIrAProcesos }: PropsCandidatos) {
  const aviso = useAvisos()
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioCandidato>(FORMULARIO_VACIO)
  const [detalle, setDetalle] = useState<CandidatoTalento | null>(null)
  const [porEliminar, setPorEliminar] = useState<CandidatoTalento | null>(null)
  const [guardando, setGuardando] = useState(false)

  const procesosPorCandidato = useMemo(() => {
    const mapa = new Map<string, typeof postulaciones>()
    for (const proceso of postulaciones) {
      const lista = mapa.get(proceso.candidato_id) ?? []
      lista.push(proceso)
      mapa.set(proceso.candidato_id, lista)
    }
    return mapa
  }, [postulaciones])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return candidatos.filas.filter((candidato) => {
      if (estadoFiltro && candidato.estado !== estadoFiltro) return false
      if (!texto) return true
      return [
        candidato.nombre,
        candidato.email,
        candidato.puesto_objetivo,
        candidato.ubicacion,
        candidato.telefono,
        ...(candidato.habilidades ?? []),
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [candidatos.filas, busqueda, estadoFiltro])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(candidato: CandidatoTalento) {
    setDetalle(null)
    setEditandoId(candidato.id)
    setFormulario({
      nombre: candidato.nombre,
      email: candidato.email,
      telefono: candidato.telefono ?? '',
      ubicacion: candidato.ubicacion ?? '',
      puesto_objetivo: candidato.puesto_objetivo,
      seniority: candidato.seniority,
      modalidad: candidato.modalidad,
      habilidades: textoDesdeHabilidades(candidato.habilidades),
      experiencia: candidato.experiencia ?? '',
      educacion: candidato.educacion ?? '',
      disponibilidad: candidato.disponibilidad ?? '',
      expectativa_salarial: candidato.expectativa_salarial == null ? '' : String(candidato.expectativa_salarial),
      cv_url: candidato.cv_url ?? '',
      estado: candidato.estado,
      visible_empresas: candidato.visible_empresas,
      consentimiento: candidato.consentimiento,
      notas: candidato.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando) return
    if (!formulario.nombre.trim() || !formulario.email.trim() || !formulario.puesto_objetivo.trim()) return
    setGuardando(true)
    const guardado = await candidatos.guardar(
      {
        nombre: formulario.nombre.trim(),
        email: formulario.email.trim().toLowerCase(),
        telefono: formulario.telefono.trim() || null,
        ubicacion: formulario.ubicacion.trim() || null,
        puesto_objetivo: formulario.puesto_objetivo.trim(),
        seniority: formulario.seniority,
        modalidad: formulario.modalidad,
        habilidades: habilidadesDesdeTexto(formulario.habilidades),
        experiencia: formulario.experiencia.trim() || null,
        educacion: formulario.educacion.trim() || null,
        disponibilidad: formulario.disponibilidad || null,
        expectativa_salarial:
          formulario.expectativa_salarial === '' ? null : Math.max(0, Number(formulario.expectativa_salarial) || 0),
        cv_url: formulario.cv_url.trim() || null,
        estado: formulario.estado,
        visible_empresas: formulario.visible_empresas,
        consentimiento: formulario.consentimiento,
        notas: formulario.notas.trim() || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  async function eliminarCandidato() {
    if (!porEliminar) return
    await candidatos.eliminar(porEliminar.id)
    setPorEliminar(null)
    await refrescar()
  }

  async function verCV(candidato: CandidatoTalento) {
    const resultado = await abrirCV(candidato.cv_path, candidato.cv_url)
    if ('error' in resultado) aviso(resultado.error, 'error')
  }

  const detalleProcesos = detalle ? procesosPorCandidato.get(detalle.id) ?? [] : []

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre, puesto, habilidad o ubicación…"
            className="pl-9"
          />
        </div>
        <Selector
          value={estadoFiltro}
          onChange={(evento) => setEstadoFiltro(evento.target.value)}
          aria-label="Filtrar por estado"
          className="sm:w-52"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_CANDIDATO.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoCandidato[estado]}
            </option>
          ))}
        </Selector>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nuevo candidato
        </Boton>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtrados.length} candidato{filtrados.length === 1 ? '' : 's'} en pantalla
      </p>

      <Tarjeta>
        {candidatos.error && <ErrorTabla mensaje={candidatos.error} />}
        {candidatos.cargando && !candidatos.error && <FilasCargando />}
        {!candidatos.cargando && !candidatos.error && filtrados.length === 0 && (
          candidatos.filas.length === 0 ? (
            <Vacio
              icono={<UserRound size={22} />}
              titulo="Todavía no hay candidatos"
              texto="Los perfiles del portal y los que registres aquí aparecerán en esta lista."
              accion={
                <Boton variante="secundario" onClick={abrirNuevo}>
                  <Plus size={16} /> Registrar candidato
                </Boton>
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

        {!candidatos.cargando && !candidatos.error && filtrados.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtrados.map((candidato) => {
              const procesos = procesosPorCandidato.get(candidato.id) ?? []
              const abiertos = procesos.filter((proceso) => !['contratada', 'rechazada'].includes(proceso.etapa)).length
              return (
                <li key={candidato.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                  <button
                    type="button"
                    onClick={() => setDetalle(candidato)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-arena text-xs font-semibold text-clay">
                      {iniciales(candidato.nombre)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-tinta">{candidato.nombre}</p>
                        <Insignia color={colorEstadoCandidato[candidato.estado]}>
                          {etiquetaEstadoCandidato[candidato.estado] ?? candidato.estado}
                        </Insignia>
                        {candidato.cv_path || candidato.cv_url ? <Insignia color="blue">CV</Insignia> : null}
                      </div>
                      <p className="truncate text-xs text-tinta-suave">
                        {candidato.puesto_objetivo} · {etiquetaSeniority[candidato.seniority] ?? candidato.seniority}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-tinta-tenue">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} /> {candidato.ubicacion || 'Sin ubicación'}
                        </span>
                        <span>· {etiquetaModalidad[candidato.modalidad] ?? candidato.modalidad}</span>
                        {(candidato.habilidades ?? []).length > 0 && (
                          <span className="truncate">· {(candidato.habilidades ?? []).slice(0, 3).join(', ')}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-tinta-tenue">
                        {abiertos > 0
                          ? `${abiertos} proceso${abiertos === 1 ? '' : 's'} activo${abiertos === 1 ? '' : 's'}`
                          : 'Sin procesos activos'}
                        {candidato.expectativa_salarial != null
                          ? ` · ${formatoDinero(candidato.expectativa_salarial)}`
                          : ''}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <BotonIcono etiqueta="Ver perfil" onClick={() => setDetalle(candidato)}>
                      <Eye size={15} />
                    </BotonIcono>
                    {(candidato.cv_path || candidato.cv_url) && (
                      <BotonIcono etiqueta="Abrir CV" onClick={() => void verCV(candidato)}>
                        <FileText size={15} />
                      </BotonIcono>
                    )}
                    <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(candidato)}>
                      <Pencil size={15} />
                    </BotonIcono>
                    <BotonIcono
                      etiqueta="Eliminar"
                      onClick={() => setPorEliminar(candidato)}
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
        titulo={editandoId ? 'Editar candidato' : 'Nuevo candidato'}
        onCerrar={() => setModalAbierto(false)}
        ancho="sm:max-w-3xl"
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre completo *">
            <Entrada
              required
              maxLength={120}
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              placeholder="Ana Pérez"
            />
          </Campo>
          <Campo etiqueta="Correo *">
            <Entrada
              required
              type="email"
              maxLength={160}
              value={formulario.email}
              onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
              placeholder="ana@correo.com"
            />
          </Campo>
          <Campo etiqueta="Puesto objetivo *">
            <Entrada
              required
              maxLength={180}
              value={formulario.puesto_objetivo}
              onChange={(evento) => setFormulario({ ...formulario, puesto_objetivo: evento.target.value })}
              placeholder="Ej. Contadora senior"
            />
          </Campo>
          <Campo etiqueta="Teléfono / WhatsApp">
            <Entrada
              type="tel"
              maxLength={40}
              value={formulario.telefono}
              onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
              placeholder="809 555 0101"
            />
          </Campo>
          <Campo etiqueta="Ubicación">
            <Entrada
              maxLength={120}
              value={formulario.ubicacion}
              onChange={(evento) => setFormulario({ ...formulario, ubicacion: evento.target.value })}
              placeholder="Santo Domingo, RD"
            />
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
          <Campo etiqueta="Disponibilidad">
            <Selector
              value={formulario.disponibilidad}
              onChange={(evento) => setFormulario({ ...formulario, disponibilidad: evento.target.value })}
            >
              <option value="">Sin indicar</option>
              {DISPONIBILIDADES.map((disponibilidad) => (
                <option key={disponibilidad} value={disponibilidad}>
                  {etiquetaDisponibilidad[disponibilidad]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Expectativa salarial (RD$)">
            <Entrada
              type="number"
              min="0"
              step="0.01"
              value={formulario.expectativa_salarial}
              onChange={(evento) => setFormulario({ ...formulario, expectativa_salarial: evento.target.value })}
              placeholder="Opcional"
            />
          </Campo>
          <Campo etiqueta="Habilidades (separadas por coma)" className="sm:col-span-2">
            <Entrada
              maxLength={800}
              value={formulario.habilidades}
              onChange={(evento) => setFormulario({ ...formulario, habilidades: evento.target.value })}
              placeholder="Excel avanzado, NIIF, Power BI, inglés"
            />
          </Campo>
          <Campo etiqueta="Experiencia" className="sm:col-span-2">
            <AreaTexto
              maxLength={3000}
              value={formulario.experiencia}
              onChange={(evento) => setFormulario({ ...formulario, experiencia: evento.target.value })}
              placeholder="Resumen de experiencia relevante, logros y años…"
            />
          </Campo>
          <Campo etiqueta="Educación" className="sm:col-span-2">
            <AreaTexto
              maxLength={1000}
              value={formulario.educacion}
              onChange={(evento) => setFormulario({ ...formulario, educacion: evento.target.value })}
              placeholder="Títulos, certificaciones, instituciones…"
            />
          </Campo>
          <Campo etiqueta="Enlace del CV (opcional)" className="sm:col-span-2">
            <Entrada
              inputMode="url"
              maxLength={500}
              value={formulario.cv_url}
              onChange={(evento) => setFormulario({ ...formulario, cv_url: evento.target.value })}
              placeholder="https://drive.google.com/… o LinkedIn"
            />
            {editandoId && (
              <span className="mt-1.5 block text-[11px] text-tinta-tenue">
                Si el candidato subió un PDF desde el portal, aparecerá en su perfil y podrás abrirlo con el botón «CV».
              </span>
            )}
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_CANDIDATO.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoCandidato[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <div className="flex flex-col justify-center gap-2">
            <label className="flex items-start gap-2.5 rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave">
              <input
                type="checkbox"
                checked={formulario.visible_empresas}
                onChange={(evento) => setFormulario({ ...formulario, visible_empresas: evento.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
              />
              Visible para empresas en el portal (perfil anónimo).
            </label>
            <label className="flex items-start gap-2.5 rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave">
              <input
                type="checkbox"
                checked={formulario.consentimiento}
                onChange={(evento) => setFormulario({ ...formulario, consentimiento: evento.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
              />
              Tengo consentimiento para guardar y usar estos datos.
            </label>
          </div>
          <Campo etiqueta="Notas internas" className="sm:col-span-2">
            <AreaTexto
              maxLength={2000}
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Referencias, expectativas, seguimiento…"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear candidato'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={detalle !== null}
        titulo={detalle ? detalle.nombre : 'Perfil del candidato'}
        onCerrar={() => setDetalle(null)}
        ancho="sm:max-w-2xl"
      >
        {detalle && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-arena text-lg font-semibold text-clay">
                  {iniciales(detalle.nombre)}
                </span>
                <div>
                  <p className="text-lg font-medium tracking-tight text-tinta">{detalle.puesto_objetivo}</p>
                  <p className="text-sm text-tinta-suave">
                    {etiquetaSeniority[detalle.seniority] ?? detalle.seniority} ·{' '}
                    {etiquetaModalidad[detalle.modalidad] ?? detalle.modalidad}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Insignia color={colorEstadoCandidato[detalle.estado]}>
                      {etiquetaEstadoCandidato[detalle.estado] ?? detalle.estado}
                    </Insignia>
                    {detalle.visible_empresas && <Insignia color="emerald">Visible a empresas</Insignia>}
                    {detalle.consentimiento && <Insignia color="blue">Con consentimiento</Insignia>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(detalle.cv_path || detalle.cv_url) && (
                  <Boton variante="secundario" onClick={() => void verCV(detalle)}>
                    <FileText size={15} /> Abrir CV
                  </Boton>
                )}
                <Boton variante="secundario" onClick={() => abrirEdicion(detalle)}>
                  <Pencil size={15} /> Editar
                </Boton>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-borde bg-superficie-2/50 p-3">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">Contacto</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta">
                  <Mail size={13} className="text-tinta-tenue" /> {detalle.email}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <Phone size={13} className="text-tinta-tenue" /> {detalle.telefono || 'Sin teléfono'}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <MapPin size={13} className="text-tinta-tenue" /> {detalle.ubicacion || 'Sin ubicación'}
                </p>
              </div>
              <div className="rounded-[20px] border border-borde bg-superficie-2/50 p-3">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">Condiciones</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <Wallet size={13} className="text-tinta-tenue" />{' '}
                  {detalle.expectativa_salarial == null ? 'Salario a convenir' : formatoDinero(detalle.expectativa_salarial)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <CalendarClock size={13} className="text-tinta-tenue" />{' '}
                  {detalle.disponibilidad
                    ? etiquetaDisponibilidad[detalle.disponibilidad] ?? detalle.disponibilidad
                    : 'Disponibilidad sin indicar'}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta-suave">
                  <BriefcaseBusiness size={13} className="text-tinta-tenue" /> {detalle.puesto_objetivo}
                </p>
              </div>
            </div>

            {(detalle.habilidades ?? []).length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  <Sparkles size={12} /> Habilidades
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(detalle.habilidades ?? []).map((habilidad) => (
                    <Insignia key={habilidad} color="blue">
                      {habilidad}
                    </Insignia>
                  ))}
                </div>
              </div>
            )}

            {detalle.experiencia && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  <BriefcaseBusiness size={12} /> Experiencia
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-tinta-suave">{detalle.experiencia}</p>
              </div>
            )}

            {detalle.educacion && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  <GraduationCap size={12} /> Educación
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-tinta-suave">{detalle.educacion}</p>
              </div>
            )}

            {detalle.notas && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  <ShieldCheck size={12} /> Notas internas
                </p>
                <p className="whitespace-pre-line rounded-[18px] border border-aviso-borde bg-aviso-suave/60 p-3 text-sm leading-relaxed text-tinta-suave">
                  {detalle.notas}
                </p>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-tinta-tenue uppercase">
                  Procesos ({detalleProcesos.length})
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
              {detalleProcesos.length === 0 ? (
                <p className="rounded-[18px] border border-borde bg-superficie-2/50 p-3 text-sm text-tinta-suave">
                  Todavía no está en ningún proceso. Puedes agregarlo desde «Procesos» o desde una vacante.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {detalleProcesos.map((proceso) => (
                    <li
                      key={proceso.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-borde bg-superficie px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate text-tinta">
                        {proceso.talento_empresas?.nombre ?? 'Empresa'} ·{' '}
                        {proceso.talento_vacantes?.titulo ?? 'Solicitud directa'}
                      </span>
                      <Insignia color={colorEtapaTalento[proceso.etapa]}>
                        {etiquetaEtapaTalento[proceso.etapa] ?? proceso.etapa}
                      </Insignia>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-[11px] text-tinta-tenue">Perfil creado el {formatoFecha(detalle.created_at)}.</p>
          </div>
        )}
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar candidato"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarCandidato()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar a <strong className="text-tinta">{porEliminar.nombre}</strong>? También se
              eliminarán sus procesos y su CV quedará sin referencia. Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </div>
  )
}
